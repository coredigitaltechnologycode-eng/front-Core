import { CanActivateFn } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  // Roles permitidos para esta ruta específica (definidos en app.routes.ts)
  const rolesPermitidos: string[] = route.data?.['rolesPermitidos'] ?? ['admin'];

  if (token && rol && rolesPermitidos.includes(rol)) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};