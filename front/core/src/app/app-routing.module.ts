import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailListComponent } from './email/email-list/email-list.component';
import { NewPasswordComponent } from './auth/new-password/new-password.component';
import { SigninComponent } from './auth/signin/signin.component';
import { authGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: SigninComponent,
  },
  {
    path: 'renew-password',
    component: NewPasswordComponent,
  },
  {
    path: 'emails',
    component: EmailListComponent,
    canActivate: [authGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
