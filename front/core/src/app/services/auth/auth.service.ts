import { Injectable } from '@angular/core';
import {
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
  ISignUpResult
} from 'amazon-cognito-identity-js';
import { Observable, Subject, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NewPasswordRequiredArgs {
  userAttributes: any,
  requiredAttributes: any,
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public onError$: Subject<Error>;
  public onNewPasswordRequired$: Subject<NewPasswordRequiredArgs>;
  public onSignIn$: Subject<CognitoUserSession>;
  public onSignOut$: Subject<void>;
  private cognitoUser;
  private sessionUserAttributes: any;
  private userPool: CognitoUserPool;

  constructor() {
    this.onError$ = new Subject<Error>();
    this.onNewPasswordRequired$ = new Subject<NewPasswordRequiredArgs>();
    this.onSignIn$ = new Subject<CognitoUserSession>();
    this.onSignOut$ = new Subject<void>();

    const poolData = {
      UserPoolId: environment.cognito.userPoolId, // CognitoユーザープールID
      ClientId: environment.cognito.clientId, // CognitoアプリクライアントID
    };
    this.userPool = new CognitoUserPool(poolData);
    this.cognitoUser = this.userPool.getCurrentUser();
  }

  signUp$(username: string, password: string, email: string): Observable<ISignUpResult> {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email })
    ];
    return new Observable((observer) => {
      this.userPool.signUp(username, password, attributeList, [], (err?: Error, result?: ISignUpResult) => {
        if (err) {
          observer.error(err);
          return;
        }
        observer.next(result);
        observer.complete();
      });
    });
  }

  getCurrentUser$(): Observable<CognitoUser | null> {
    return new Observable((observer) => {
      if (!this.cognitoUser) {
        observer.next(null);
        observer.complete();
        return;
      }
      this.cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          this.cognitoUser = null;
        }
        observer.next(this.cognitoUser);
        observer.complete();
      });
    });
  }

  isSignedin$(): Observable<boolean> {
    return this.getCurrentUser$().pipe(
      switchMap((value: CognitoUser | null) => {
        if (!value) return of(false);
        return of(true);
      })
    );
  }

  signin(username: string, password: string): void {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password
    });

    this.cognitoUser = new CognitoUser({
      Username: username,
      Pool: this.userPool
    });

    this.cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => this.onSignIn$.next(session),
      onFailure: (err) => this.onError$.next(err),
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // User was signed up by an admin and must provide new
        // password and required attributes, if any, to complete
        // authentication.

        // the api doesn't accept this field back
        delete userAttributes.email_verified;
        delete userAttributes.email;

        // store userAttributes on global variable
        this.sessionUserAttributes = userAttributes;

        this.onNewPasswordRequired$.next({
          userAttributes: userAttributes,
          requiredAttributes: requiredAttributes,
        });
      },
    });
  }

  newPassword(password: string): void {
    if (!this.sessionUserAttributes) {
      this.onError$.next(new Error('Invalid flow, sessionUserAttributes does not exists.'));
      return;
    }
    if (!this.cognitoUser) {
      this.onError$.next(new Error('Invalid flow, cognitoUser does not exists.'));
      return;
    }

    this.cognitoUser.completeNewPasswordChallenge(password, this.sessionUserAttributes, {
      onSuccess: (session) => {
        this.sessionUserAttributes = null;
        this.onSignIn$.next(session);
      },
      onFailure: (err) => {
        this.onError$.next(err);
      }
    });
  }

  signout(): void {
    if (this.cognitoUser) {
      this.cognitoUser.signOut();
      this.cognitoUser = null;
      this.onSignOut$.next();
    }
  }
}
