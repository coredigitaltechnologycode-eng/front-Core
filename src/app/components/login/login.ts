import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CoreAdmin, LoginAdminPayload, LoginAdminResponse } from '../../services/core-admin';
import { CoreCliente, LoginClientePayload, LoginClienteResponse } from '../../services/core-cliente';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  mostrarModal = false;
  modalExito = false;
  modalMensaje = '';

  constructor(
    private fb: FormBuilder,
    private coreAdmin: CoreAdmin,
    private coreCliente: CoreCliente,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    // Ya no forzamos formato email: puede ser correo (admin/cliente) o usuario_creado (cliente)
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.isLoading) return;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const identificador: string = this.loginForm.value.username;
    const contraseña: string = this.loginForm.value.password;

    // 1. Se intenta primero como administrador
    const credencialesAdmin: LoginAdminPayload = { correo: identificador, contraseña };

    this.coreAdmin.loginAdmin(credencialesAdmin).subscribe({
      next: (respuesta: LoginAdminResponse) => this.manejarLoginExitoso(respuesta.token, respuesta.rol, respuesta.nombres_completos),
      error: (errorAdmin: HttpErrorResponse) => {
        // 2. Si no es admin (401), se intenta como cliente
        if (errorAdmin.status === 401) {
          const credencialesCliente: LoginClientePayload = { identificador, contraseña };

          this.coreCliente.loginCliente(credencialesCliente).subscribe({
            next: (respuesta: LoginClienteResponse) => this.manejarLoginExitoso(respuesta.token, respuesta.rol, respuesta.nombres_completos),
            error: (errorCliente: HttpErrorResponse) => this.manejarLoginFallido(errorCliente),
          });
        } else {
          this.manejarLoginFallido(errorAdmin);
        }
      },
    });
  }

  private manejarLoginExitoso(token: string, rol: string, nombresCompletos: string): void {
    this.isLoading = false;

    this.authService.guardarSesion(token, rol, nombresCompletos);

    this.modalExito = true;
    this.modalMensaje = `Login exitoso. Bienvenido ${nombresCompletos}`;
    this.mostrarModal = true;

    this.cdr.detectChanges();

    setTimeout(() => {
      this.authService.redirigirSegunRol();
    }, 1500);
  }

  private manejarLoginFallido(error: HttpErrorResponse): void {
    this.isLoading = false;
    this.modalExito = false;
    this.modalMensaje = this.obtenerMensajeError(error);
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;

    if (this.modalExito) {
      this.authService.redirigirSegunRol();
    }
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (error.error?.detail) {
      return typeof error.error.detail === 'string'
        ? error.error.detail
        : 'Credenciales inválidas.';
    }
    return 'Ocurrió un error al iniciar sesión. Intenta de nuevo.';
  }
}