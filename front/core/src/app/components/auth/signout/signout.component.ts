import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-signout',
  imports: [ReactiveFormsModule],
  templateUrl: './signout.component.html',
  styleUrl: './signout.component.scss',
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
