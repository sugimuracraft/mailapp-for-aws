import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './components/auth/signin/signin.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { NewPasswordComponent } from './components/auth/new-password/new-password.component';
import { EmailListComponent } from './components/email/email-list/email-list.component';
import { SignoutComponent } from './components/auth/signout/signout.component';
import { AuthInterceptor } from './services/common/auth-interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    EmailListComponent,
    SigninComponent,
    NewPasswordComponent,
    SignoutComponent,
    SignupComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
