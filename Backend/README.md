# Backend — Sistema de Login y CRUD de Clientes

API REST en NestJS con autenticación JWT y SQL Server, para el módulo de login y el mantenimiento de clientes.

## Stack

NestJS 11 · TypeORM 0.3 · SQL Server (driver `mssql`) · Passport + `@nestjs/jwt` · `class-validator` / `class-transformer` · bcrypt

## Requisitos previos

- Node.js 22+
- Un SQL Server accesible (local, Docker, o remoto) — no viene incluido, hay que levantarlo aparte

## Configuración

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear el archivo `.env` en la raíz de `Backend/` con estas variables:
   ```env
   # Base de datos
   DB_HOST=127.0.0.1
   DB_PORT=1433
   DB_USERNAME=sa
   DB_PASSWORD=<tu password de SQL Server>
   DB_DATABASE=ChardonDB

   # JWT
   JWT_SECRET=<un secreto largo y aleatorio>
   JWT_EXPIRES_IN=1h

   # App
   PORT=3000
   ```
3. La base de datos (`ChardonDB`) tiene que existir de antemano — TypeORM crea las **tablas** automáticamente (`synchronize: true`), pero no crea la base en sí.

## Cómo correrlo

```bash
npm run start:dev      # levanta la API con hot-reload en http://localhost:3000
npm run seed            # crea un usuario de prueba: admin@chardon.com / Admin123!
```

## Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run start:dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | Corre el build compilado |
| `npm run seed` | Crea un usuario de prueba con password hasheado |
| `npm run lint` | ESLint con autofix |
| `npm run test` | Tests unitarios (Jest) |

## Endpoints

### Auth
| Método | Ruta | Protegido | Descripción |
|---|---|---|---|
| POST | `/auth/login` | No | Recibe `{ email, password }`, devuelve `{ access_token }` |
| GET | `/auth/profile` | Sí | Devuelve el payload del token decodificado |

### Clientes (todos requieren `Authorization: Bearer <token>`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/clientes?page=1&limit=10` | Lista paginada de clientes activos |
| GET | `/clientes/:id` | Un cliente por id (404 si no existe) |
| POST | `/clientes` | Crea un cliente (409 si cédula/email duplicado) |
| PATCH | `/clientes/:id` | Actualiza campos parciales |
| DELETE | `/clientes/:id` | Soft-delete (marca `activo = false`) |

## Estructura del proyecto

```
src/
├── auth/          # Login, JWT strategy, guard
├── users/         # Entidad y service de usuarios (login)
├── clientes/      # CRUD completo de clientes
├── app.module.ts  # Conexión a BD + registro de módulos
└── seed.ts        # Script standalone para crear el usuario de prueba
```

## Documentos de apoyo

- [`APRENDIZAJE.md`](APRENDIZAJE.md) — el recorrido de cómo se entendió el mecanismo de Guard + Strategy
- [`COMO_LO_CONSTRUI.md`](COMO_LO_CONSTRUI.md) — explicación completa de cada módulo, en orden de construcción
