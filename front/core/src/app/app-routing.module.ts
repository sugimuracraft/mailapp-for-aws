import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailListComponent } from './components/email/email-list/email-list.component';
import { NewPasswordComponent } from './components/auth/new-password/new-password.component';
import { SigninComponent } from './components/auth/signin/signin.component';
import { authGuard } from './components/auth/auth.guard';

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
