import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

// Datos que envía el formulario de ingreso de clientes hacia el backend
export interface RegistroClientePayload {
  cedula: string;
  nombres_completos: string;
  direccion: string;
  correo: string;
  telefono: string;
  usuario_creado: string;
  contraseña_creada: string;
  plan_seleccionado: string;
  
}

// Respuesta esperada del backend (según clientes_nodos.py -> crear_cliente)
export interface RegistroClienteResponse {
  mensaje?: string;
  cedula?: string;
}

// Datos que envía el formulario de login de cliente hacia el backend
export interface LoginClientePayload {
  identificador: string; // correo o usuario_creado
  contraseña: string;
}

// Respuesta esperada del backend (según main.py -> /login/cliente)
export interface LoginClienteResponse {
  mensaje: string;
  token: string;
  rol: string;
  cedula: string; 
  nombres_completos: string;
  plan_seleccionado: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoreCliente {
  // Ajusta esta URL cuando despliegues (por ahora backend local con Uvicorn)
  private readonly baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  /**
   * Envía el formulario de ingreso de cliente al backend FastAPI.
   * POST /registro/cliente
   */
  registrarCliente(datos: RegistroClientePayload): Observable<RegistroClienteResponse> {
    return this.http
      .post<RegistroClienteResponse>(`${this.baseUrl}/registro/cliente`, datos)
      .pipe(catchError(this.manejarError));
  }

  /**
   * Envía las credenciales al backend FastAPI para autenticar al cliente.
   * POST /login/cliente
   * Si son correctas, el backend retorna un token JWT con rol "cliente".
   */
  loginCliente(datos: LoginClientePayload): Observable<LoginClienteResponse> {
    return this.http
      .post<LoginClienteResponse>(`${this.baseUrl}/login/cliente`, datos)
      .pipe(catchError(this.manejarError));
  }

  private manejarError(error: HttpErrorResponse) {
    // Si el backend responde 4xx/5xx, FastAPI normalmente manda el detalle en error.error
    console.error('Error en la petición:', error);
    return throwError(() => error);
  }
}
