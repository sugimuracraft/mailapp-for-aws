import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CognitoUserSession } from 'amazon-cognito-identity-js';

import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent {
  errorMessage: string;
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.errorMessage = '';
    this.form = this.formBuilder.group({
      password: '',
      passwordConfirm: '',
    });

    authService.onError$.subscribe(this.handleError.bind(this));
    authService.onSignIn$.subscribe(this.handleSignIn.bind(this));
  }

  onSubmit() {
    const formData = this.form.value;
    if (formData.password !== formData.passwordConfirm) {
      this.errorMessage = 'password does not match.'
      return;
    }
    this.authService.newPassword(formData.password);
  }

  handleSignIn(session: CognitoUserSession) {
    console.log(session);
    this.router.navigate(['/emails']);
  }

  handleError(err: Error) {
    this.errorMessage = err.message;
  }
}
