import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Intercepta respostas HTTP 401 de qualquer chamada admin.
 * Limpa os metadados de sessão e redireciona para login.
 * Resolve A3: sessão expirada em voo não deixa o utilizador num estado inválido.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && req.url.includes('/admin-')) {
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_expires');
        router.navigate(['/admin/login'], {
          state: { sessionExpired: true }
        });
      }
      return throwError(() => err);
    })
  );
};
