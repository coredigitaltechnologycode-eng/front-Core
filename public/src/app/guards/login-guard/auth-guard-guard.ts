import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  // Deja pasar solo si hay token y el rol es "admin"
  if (token && rol === 'admin') {
    return true;
  }

  // Si no cumple, lo redirige al login y bloquea el acceso
  router.navigate(['/login']);
  return false;
};