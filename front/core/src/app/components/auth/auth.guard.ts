import {inject} from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../services/auth/auth.service';

/**
 * This guard will transition the user to the top screen if the user is not signed in.
 * see: https://angular.io/guide/router-tutorial-toh#milestone-5-route-guards
 * @returns Promise<true | UrlTree>
 */
export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!await firstValueFrom(authService.isSignedin$())) {
    return router.parseUrl('/');
  }

  return true;
};
