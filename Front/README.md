# Frontend — Login y CRUD de Clientes

SPA en Angular que consume la API del `Backend/`: login con JWT y mantenimiento de clientes.

## Stack

Angular 19 (standalone components) · NgRx (store, effects, store-devtools) · Bootstrap 5 · RxJS

## Requisitos previos

- Node.js 22+
- El `Backend/` corriendo (por defecto en `http://localhost:3000`) — sin él, el login y el CRUD no van a poder conectarse

## Configuración

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. La URL del backend se configura en `src/environments/environment.ts` (desarrollo) y `environment.prod.ts` (producción):
   ```ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000',
   };
   ```

## Cómo correrlo

```bash
npm run start   # levanta el dev server en http://localhost:4200
```

Con el `Backend/` corriendo y un usuario creado (`npm run seed` desde `Backend/`), se puede iniciar sesión con `admin@chardon.com` / `Admin123!`.

## Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run start` | Dev server con hot-reload |
| `npm run build` | Build de producción en `dist/` |
| `npm run test` | Tests unitarios (Karma/Jasmine) |

## Rutas de la aplicación

| Ruta | Protegida | Componente |
|---|---|---|
| `/login` | No | Formulario de login |
| `/clientes` | Sí | Listado paginado con búsqueda |
| `/clientes/nuevo` | Sí | Formulario de creación |
| `/clientes/:id` | Sí | Detalle de solo lectura |
| `/clientes/:id/editar` | Sí | Formulario de edición |

## Estructura del proyecto

```
src/app/
├── auth/
│   ├── login/          # Formulario reactivo
│   ├── guards/          # Protección de rutas privadas
│   ├── interceptors/    # Inyección automática del Bearer token
│   ├── services/        # Llamadas HTTP + manejo del token
│   └── store/           # NgRx: actions, reducer, effects, selectors
├── clientes/
│   ├── list/             # Tabla + búsqueda + paginación
│   ├── form/              # Formulario reutilizable (crear/editar/ver)
│   ├── services/           # ClienteService
│   ├── models/             # Interfaces de Cliente
│   └── store/              # NgRx propio del módulo
├── app.config.ts   # Providers globales (router, HTTP, NgRx)
└── app.routes.ts   # Definición de rutas
```
