import { Routes } from '@angular/router';

import { RenewPasswordComponent } from './components/auth/renew-password/renew-password.component';
import { SigninComponent } from './components/auth/signin/signin.component';
import { EmailListComponent } from './components/email/email-list/email-list.component';
import { authGuard } from './guards/auth/auth.guard';
import { EmailDetailComponent } from './components/email/email-detail/email-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: SigninComponent,
  },
  {
    path: 'renew-password',
    component: RenewPasswordComponent,
  },
  {
    path: 'emails',
    component: EmailListComponent,
    canActivate: [authGuard],
    //children: [
    //  {
    //    path: ':id',
    //    component: EmailDetailComponent,
    //  },
    //]
  },
  {
    path: 'emails/:id',
    component: EmailDetailComponent,
    canActivate: [authGuard],
  },
];
