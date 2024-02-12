import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-signout',
  templateUrl: './signout.component.html',
  styleUrl: './signout.component.scss'
})
export class SignoutComponent {
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.form = this.formBuilder.group({});

    this.authService.onSignOut$.subscribe(this.handleSignout.bind(this));
  }

  onSubmit(): void {
    this.authService.signout();
  }

  handleSignout(): void {
    this.router.navigate(['/']);
  }
}
