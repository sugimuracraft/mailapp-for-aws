import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';

import { AuthService, NewPasswordRequiredArgs } from '../../auth.service';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
})
export class SigninComponent implements OnInit {
  errorMessage: string;
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.errorMessage = '';
    this.form = this.formBuilder.group({
      username: '',
      password: '',
    });

    authService.onError$.subscribe(this.handleError.bind(this));
    authService.onSignIn$.subscribe(this.handleSignIn.bind(this));
    authService.onNewPasswordRequired$.subscribe(this.handleNewPasswordRequired.bind(this));
  }

  async ngOnInit(): Promise<void> {
    if (await this.authService.isSignedin()) {
      this.router.navigate(['/emails']);
    }
  }

  onSubmit() {
    const formData = this.form.value;
    this.authService.signin(formData.username, formData.password);
    //this.form.reset();
  }

  handleSignIn(session: CognitoUserSession) {
    this.router.navigate(['/emails']);
  }

  handleError(err: Error) {
    this.errorMessage = err.message;
  }

  handleNewPasswordRequired(args: NewPasswordRequiredArgs) {
    this.router.navigate(['/renew-password']);
  }
}
