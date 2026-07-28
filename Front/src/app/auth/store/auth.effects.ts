import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(({ access_token }) =>
            AuthActions.loginSuccess({ token: access_token }),
          ),
          catchError((err: HttpErrorResponse) =>
            of(AuthActions.loginFailure({ error: this.mapError(err) })),
          ),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ token }) => {
          this.authService.saveToken(token);
          void this.router.navigate(['/clientes']);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.clearToken();
          void this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  private mapError(err: HttpErrorResponse): string {
    if (err.status === 401) {
      return 'Credenciales incorrectas. Verifica tu email y contraseña.';
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Intenta más tarde.';
    }
    return 'Ocurrió un error inesperado. Intenta nuevamente.';
  }
}
