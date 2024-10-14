import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../../services/auth/auth.service';
import { switchMap, throwError } from 'rxjs';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  return authService.getCurrentUser$().pipe(
    switchMap((session) => {
      if (!session) {
        return throwError(() => {return new Error('Unauthorized')});
      }
      const newRequest = req.clone({
        headers: req.headers.set('Authorization', session.getIdToken().getJwtToken())
      });
      return next(newRequest);
    })
  );
};
