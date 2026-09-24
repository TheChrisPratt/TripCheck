import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Ensure withCredentials is enabled for all API requests to carry HttpOnly session cookies
  const modifiedReq = req.clone({
    withCredentials: true
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth/')) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
