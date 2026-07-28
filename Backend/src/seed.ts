import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

const SEED_EMAIL = 'admin@chardon.com';
const SEED_PASSWORD = 'Admin123!';
const SEED_NOMBRE = 'Administrador';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const existente = await usersService.findByEmail(SEED_EMAIL);
  if (existente) {
    console.log(
      `Ya existe un usuario con email ${SEED_EMAIL}, no se creó nada.`,
    );
  } else {
    await usersService.create({
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
      nombre: SEED_NOMBRE,
    });
    console.log('Usuario de prueba creado:');
    console.log(`  email:    ${SEED_EMAIL}`);
    console.log(`  password: ${SEED_PASSWORD}`);
  }

  await app.close();
}

void seed();
