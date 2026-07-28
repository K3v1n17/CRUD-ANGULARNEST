# Cómo construí el Backend — explicado completo

Todo el Backend, contado en primera persona, en el orden en que se conecta una pieza con la siguiente. Para el recorrido tipo "preguntas y respuestas" del Guard/Strategy está `APRENDIZAJE.md`.

---

## La base: 3 módulos, uno por responsabilidad

Organicé el proyecto en `auth`, `users` y `clientes`. Todos se conectan en un solo lugar, `app.module.ts`:

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        // ...
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    ClientesModule,
  ],
})
export class AppModule {}
```

Acá pasan dos cosas de fondo: `ConfigModule.forRoot({ isGlobal: true })` hace que `ConfigService` (que lee el `.env`) esté disponible en toda la app sin tener que importarlo de nuevo en cada módulo. Y `TypeOrmModule.forRootAsync` arma la conexión a SQL Server leyendo esas mismas variables — con el `Number(...)` puesto a propósito, porque `ConfigService` siempre devuelve strings, y el driver `mssql` exige que el puerto sea numérico.

---

## Módulo Auth

### Primero, el DTO — nunca confío en el body crudo

```ts
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
```

Antes de escribir cualquier lógica, definí cómo tiene que verse un login válido. Estos decoradores de `class-validator` no se ejecutan solos — los corre un `ValidationPipe` que configuré una sola vez, global, en `main.ts`:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

`whitelist: true` descarta cualquier campo del body que no esté declarado en el DTO. `forbidNonWhitelisted: true` va más allá: si llega un campo de más, rechaza la petición entera con 400 en vez de solo ignorarlo. Esta es la técnica que se repite en todo el proyecto — nunca valido a mano dentro de un método, siempre delego en un DTO tipado más este pipe global.

### El controller solo recibe y delega

```ts
@Post('login')
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto.email, loginDto.password);
}
```

Sin lógica propia. Todo el trabajo real vive en el service.

### El service — bcrypt para comparar, JWT para firmar

```ts
async login(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user) throw new UnauthorizedException('Credenciales inválidas');

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

  if (!user.activo) throw new UnauthorizedException('Usuario inactivo');

  const payload = { sub: user.id, email: user.email };
  return { access_token: this.jwtService.sign(payload) };
}
```

`bcrypt.compare` nunca compara contraseñas con un `===` directo — el hash lleva un salt aleatorio distinto por usuario, así que la comparación necesita el algoritmo específico de bcrypt. El `payload` del token nunca lleva la contraseña, solo `id` y `email` — el JWT no está encriptado, solo codificado, cualquiera puede leerlo si lo intercepta.

### El Guard — decide *cuándo* exigir sesión

```ts
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Vacío a propósito: hereda toda la lógica de `AuthGuard('jwt')` de `@nestjs/passport`. Se activa con `@UseGuards(JwtAuthGuard)`, puesto sobre un método (`auth.controller.ts`, en `/profile`) o sobre una clase completa (`clientes.controller.ts`, protegiendo las 5 rutas de una).

### La Strategy — sabe *cómo* validar un JWT específicamente

```ts
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

El string `'jwt'` tiene que ser idéntico al que usa `AuthGuard('jwt')` — es el nombre con el que Passport la registra internamente cuando Nest la instancia, porque está declarada en `providers: [AuthService, JwtStrategy]` de `auth.module.ts`. Nunca escribo `new JwtStrategy()` a mano; con ponerla en `providers` alcanza para que el framework la cree y la conecte sola.

---

## Módulo Users

### La entidad, calcada del DDL que pedía el examen

```ts
@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  fecha_creacion!: Date;
}
```

### El service — el lado de "almacenar" que completaba el bcrypt

```ts
const SALT_ROUNDS = 10;

async create(data: CreateUserInput): Promise<User> {
  const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = this.userRepository.create({
    email: data.email,
    password_hash,
    nombre: data.nombre,
  });
  return this.userRepository.save(user);
}
```

El login ya cubría "comparar" contraseñas con bcrypt; este método cubre el otro lado del mismo requerimiento — "almacenar" — hasheando antes de guardar. Lo uso desde un script aparte, `seed.ts`, que crea un usuario de prueba sin exponer un endpoint público de registro (que el examen no pedía).

---

## Módulo Clientes

### Los DTOs, mismo patrón que login, otro caso

```ts
export class CreateClienteDto {
  @IsNotEmpty()
  @Length(10, 13)
  cedula!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;
  // ...
}

export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
```

Para el DTO de actualización no dupliqué las reglas — `PartialType` de `@nestjs/mapped-types` toma el DTO de creación y hace todos sus campos opcionales automáticamente, conservando las mismas validaciones cuando sí vienen.

### El controller — 5 rutas, todas protegidas de una

```ts
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.clientesService.findAll(page, limit);
  }
  // GET :id, POST, PATCH :id, DELETE :id
}
```

El PDF solo pedía explícitamente proteger el `GET /clientes`, pero puse el guard arriba de la clase completa — no tendría sentido exigir sesión para listar y dejar abierto crear o borrar.

### El service — duplicados, soft-delete, y la fecha que no se pone sola

```ts
async create(dto: CreateClienteDto): Promise<Cliente> {
  const existente = await this.clienteRepo.findOne({
    where: [{ cedula: dto.cedula }, { email: dto.email }],
  });
  if (existente) throw new ConflictException('Ya existe un cliente con esa cédula o email');

  const cliente = this.clienteRepo.create(dto);
  return this.clienteRepo.save(cliente);
}

async update(id: number, dto: UpdateClienteDto): Promise<Cliente> {
  const cliente = await this.findOne(id);
  // ... revalida duplicados si cambia cédula o email
  Object.assign(cliente, dto, { fecha_modificacion: new Date() });
  return this.clienteRepo.save(cliente);
}

async remove(id: number): Promise<void> {
  const cliente = await this.findOne(id);
  await this.clienteRepo.save({ ...cliente, activo: false });
}
```

Tres decisiones concretas acá: el `where` con array en `create` se traduce a un `OR` en SQL, para chequear cédula o email de una sola consulta. En `update`, `fecha_modificacion` se pone a mano porque, a diferencia de `fecha_creacion`, esa columna no tiene un default automático en la base de datos. Y `remove` nunca ejecuta un `DELETE` real — guarda con `activo: false`, para no perder el historial si ese cliente tiene datos relacionados en otro lado.

---

## Cierre

Los 3 módulos comparten la misma filosofía: nunca confiar en datos sin pasar por un DTO validado, separar el controller (recibe y delega) del service (piensa), y que cada decisión de diseño tenga una razón concreta — no son reglas arbitrarias, cada una resuelve un problema real (duplicados, historial, seguridad de contraseñas, consistencia de columnas).
