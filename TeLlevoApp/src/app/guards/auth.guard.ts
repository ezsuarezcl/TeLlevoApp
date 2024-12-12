import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, catchError, of, Observable, timeout } from 'rxjs';

const LOGIN_ROUTE = '/login';

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Redirigir al inicio de sesión
  const redirectToLogin = (): UrlTree => router.createUrlTree([LOGIN_ROUTE]);

  return authState(auth).pipe(
    timeout(5000),
    map((user) => (user ? true : redirectToLogin())),
    catchError((error) => {
      console.error('Error en el guardia de autenticación o tiempo excedido:', error);
      return of(redirectToLogin());
    })
  );
};
