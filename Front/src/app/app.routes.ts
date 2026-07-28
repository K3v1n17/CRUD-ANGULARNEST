import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./clientes/list/clientes-list.component').then(
        (m) => m.ClientesListComponent,
      ),
  },
  {
    path: 'clientes/nuevo',
    canActivate: [authGuard],
    data: { modo: 'create' },
    loadComponent: () =>
      import('./clientes/form/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },
  {
    path: 'clientes/:id/editar',
    canActivate: [authGuard],
    data: { modo: 'edit' },
    loadComponent: () =>
      import('./clientes/form/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },
  {
    path: 'clientes/:id',
    canActivate: [authGuard],
    data: { modo: 'view' },
    loadComponent: () =>
      import('./clientes/form/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
