import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CoreAdmin, LoginAdminPayload, LoginAdminResponse } from '../../services/core-admin';
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
    private authService: AuthService,
    private cdr: ChangeDetectorRef // 👈 clave para forzar el repintado
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
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
    // 👇 evita doble envío si ya hay una petición en curso
    if (this.isLoading) return;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const credentials: LoginAdminPayload = {
      correo: this.loginForm.value.username,
      contraseña: this.loginForm.value.password,
    };

    this.coreAdmin.loginAdmin(credentials).subscribe({
      next: (respuesta: LoginAdminResponse) => {
        this.isLoading = false;

        this.authService.guardarSesion(
          respuesta.token,
          respuesta.rol,
          respuesta.nombres_completos
        );

        this.modalExito = true;
        this.modalMensaje = `Login exitoso. Bienvenido ${respuesta.nombres_completos}`;
        this.mostrarModal = true;

        // 👇 fuerza el repintado inmediato en el mismo ciclo
        this.cdr.detectChanges();

        setTimeout(() => {
          this.authService.redirigirSegunRol();
        }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.modalExito = false;
        this.modalMensaje = this.obtenerMensajeError(error);
        this.mostrarModal = true;

        // 👇 mismo forzado aquí
        this.cdr.detectChanges();
      },
    });
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