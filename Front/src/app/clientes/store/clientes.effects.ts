import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ClienteService } from '../services/cliente.service';
import * as ClientesActions from './clientes.actions';

@Injectable()
export class ClientesEffects {
  private readonly actions$ = inject(Actions);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);

  loadClientes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClientesActions.loadClientes),
      switchMap(({ page, limit }) =>
        this.clienteService.getAll(page, limit).pipe(
          map(({ data, total, page: p, limit: l }) =>
            ClientesActions.loadClientesSuccess({ data, total, page: p, limit: l }),
          ),
          catchError((err: HttpErrorResponse) =>
            of(ClientesActions.loadClientesFailure({ error: this.mapError(err) })),
          ),
        ),
      ),
    ),
  );

  createCliente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClientesActions.createCliente),
      switchMap(({ dto }) =>
        this.clienteService.create(dto).pipe(
          map((cliente) => ClientesActions.createClienteSuccess({ cliente })),
          catchError((err: HttpErrorResponse) =>
            of(ClientesActions.createClienteFailure({ error: this.mapError(err) })),
          ),
        ),
      ),
    ),
  );

  createClienteSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ClientesActions.createClienteSuccess),
        tap(() => void this.router.navigate(['/clientes'])),
      ),
    { dispatch: false },
  );

  updateCliente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClientesActions.updateCliente),
      switchMap(({ id, dto }) =>
        this.clienteService.update(id, dto).pipe(
          map((cliente) => ClientesActions.updateClienteSuccess({ cliente })),
          catchError((err: HttpErrorResponse) =>
            of(ClientesActions.updateClienteFailure({ error: this.mapError(err) })),
          ),
        ),
      ),
    ),
  );

  updateClienteSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ClientesActions.updateClienteSuccess),
        tap(() => void this.router.navigate(['/clientes'])),
      ),
    { dispatch: false },
  );

  removeCliente$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClientesActions.removeCliente),
      switchMap(({ id }) =>
        this.clienteService.delete(id).pipe(
          map(() => ClientesActions.removeClienteSuccess({ id })),
          catchError((err: HttpErrorResponse) =>
            of(ClientesActions.removeClienteFailure({ error: this.mapError(err) })),
          ),
        ),
      ),
    ),
  );

  private mapError(err: HttpErrorResponse): string {
    if (err.status === 409) {
      return 'Ya existe un cliente con esa cédula o email.';
    }
    if (err.status === 404) {
      return 'El cliente no existe o ya fue eliminado.';
    }
    if (err.status === 401) {
      return 'Tu sesión expiró. Inicia sesión nuevamente.';
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
    return 'Ocurrió un error inesperado. Intenta nuevamente.';
  }
}
