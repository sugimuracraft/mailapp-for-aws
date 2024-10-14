import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../services/auth/auth.service';


export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const loggedIn = await firstValueFrom(authService.isSignedin$());
  if (!loggedIn) {
    return router.parseUrl('/');
  }

  return true;
};
