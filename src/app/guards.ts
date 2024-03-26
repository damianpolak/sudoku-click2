import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const isNavigatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  return router.navigated || router.navigate(['home']);
};
