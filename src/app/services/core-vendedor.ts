import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

// Datos que envía el formulario de ingreso de vendedor hacia el backend
// (cedula_cliente va en la URL, no en el body -> ver core-vendedor.registrarVendedor)
export interface RegistroVendedorPayload {
  cedula: string;
  nombres_completos: string;
  fecha_ingreso: string;      // dd/mm/aaaa
  tipo_contrato: string;      // tiempo_indefinido | plazo_fijo | temporal | practicas
  fecha_nacimiento: string;   // dd/mm/aaaa
  salario: number;
  usuario_creado: string;
  contraseña_creada: string;
}

// Respuesta esperada del backend (según main.py -> /clientes/{cedula_cliente}/colaboradores)
export interface RegistroVendedorResponse {
  mensaje?: string;
  cedula?: string;
}

// Datos que envía el formulario de login de vendedor hacia el backend
export interface LoginVendedorPayload {
  usuario_creado: string;
  contraseña: string;
}

// Respuesta esperada del backend (según main.py -> /clientes/{cedula_cliente}/colaboradores/login)
export interface LoginVendedorResponse {
  mensaje: string;
  token: string;
  rol: string;
  nombres_completos: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoreVendedor {
  // Ajusta esta URL cuando despliegues (por ahora backend local con Uvicorn)
  private readonly baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  /**
   * Envía el formulario de ingreso de vendedor/colaborador al backend FastAPI.
   * POST /clientes/{cedula_cliente}/colaboradores
   */
  registrarVendedor(
    cedulaCliente: string,
    datos: RegistroVendedorPayload,
  ): Observable<RegistroVendedorResponse> {
    return this.http
      .post<RegistroVendedorResponse>(
        `${this.baseUrl}/clientes/${cedulaCliente}/colaboradores`,
        datos,
      )
      .pipe(catchError(this.manejarError));
  }

  /**
   * Envía las credenciales al backend FastAPI para autenticar al colaborador.
   * POST /clientes/{cedula_cliente}/colaboradores/login
   */
  loginVendedor(
    cedulaCliente: string,
    datos: LoginVendedorPayload,
  ): Observable<LoginVendedorResponse> {
    return this.http
      .post<LoginVendedorResponse>(
        `${this.baseUrl}/clientes/${cedulaCliente}/colaboradores/login`,
        datos,
      )
      .pipe(catchError(this.manejarError));
  }

  private manejarError(error: HttpErrorResponse) {
    console.error('Error en la petición:', error);
    return throwError(() => error);
  }
}
