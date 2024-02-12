import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CognitoUserSession } from 'amazon-cognito-identity-js';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.getCurrentUser$().pipe(
      switchMap((value: CognitoUserSession | null) => {
        if (!value) {
          return throwError(() => {return new Error('Unauthorized')});
        }

        const newRequest = req.clone({
          headers: req.headers.set('Authorization', value.getIdToken().getJwtToken())
        })
        return next.handle(newRequest);
      })
    );
  }
}
