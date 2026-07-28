import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

// Datos que envía el formulario de Angular hacia el backend
export interface RegistroAdminPayload {
  cedula: string;
  nombres_completos: string;
  rol: string;
  correo: string;
  contraseña: string;
}

// Respuesta esperada del backend (según admin_nodos.py -> crear_admin)
export interface RegistroAdminResponse {
  exito: boolean;
  cedula?: string;
  errores?: { [campo: string]: string };
}

// Datos que envía el formulario de login hacia el backend
export interface LoginAdminPayload {
  correo: string;
  contraseña: string;
}

// Respuesta esperada del backend (según main.py -> /login)
export interface LoginAdminResponse {
  mensaje: string;
  token: string;
  rol: string;
  nombres_completos: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoreAdmin {
  // Ajusta esta URL cuando despliegues (por ahora backend local con Uvicorn)
  private readonly baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  /**
   * Envía el formulario de registro de administrador al backend FastAPI.
   * POST /registro/admin
   */
  registrarAdmin(datos: RegistroAdminPayload): Observable<RegistroAdminResponse> {
    return this.http
      .post<RegistroAdminResponse>(`${this.baseUrl}/registro/admin`, datos)
      .pipe(catchError(this.manejarError));
  }

  /**
   * Envía las credenciales al backend FastAPI para autenticar al administrador.
   * POST /login
   * Si las credenciales son correctas, el backend retorna un token JWT.
   */
  loginAdmin(datos: LoginAdminPayload): Observable<LoginAdminResponse> {
    return this.http
      .post<LoginAdminResponse>(`${this.baseUrl}/login`, datos)
      .pipe(catchError(this.manejarError));
  }

  private manejarError(error: HttpErrorResponse) {
    // Si el backend responde 4xx/5xx, FastAPI normalmente manda el detalle en error.error
    console.error('Error en la petición:', error);
    return throwError(() => error);
  }
}