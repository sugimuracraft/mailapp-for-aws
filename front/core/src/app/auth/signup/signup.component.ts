import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ISignUpResult } from 'amazon-cognito-identity-js';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  errorMessage: string;
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
  ) {
    this.errorMessage = '';
    this.form = this.formBuilder.group({
      username: '',
      password: '',
      email: '',
    });
  }

  onSubmit() {
    const formData = this.form.value;
    this.authService.signUp$(
      formData.username,
      formData.password,
      formData.email
    ).subscribe(this.handleSignup.bind(this));
  }

  handleSignup(result: ISignUpResult) {

  }
}
