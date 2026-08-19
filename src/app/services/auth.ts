import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  guardarSesion(token: string, rol: string, nombresCompletos: string, cedula: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol);
    localStorage.setItem('nombres_completos', nombresCompletos);
    localStorage.setItem('cedula', cedula);   // 👈 nuevo
  }

  redirigirSegunRol(): void {
    const rol = localStorage.getItem('rol');

    if (rol === 'admin') {
      this.router.navigate(['/home-admin']);
    } else if (rol === 'cliente') {
      this.router.navigate(['/home-cliente']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerCedula(): string | null {           // 👈 nuevo
    return localStorage.getItem('cedula');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombres_completos');
    localStorage.removeItem('cedula');        // 👈 no olvides limpiarla también
    this.router.navigate(['/login']);
  }
}