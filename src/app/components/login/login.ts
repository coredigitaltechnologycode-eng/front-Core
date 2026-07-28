import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./login.css'] // Cambiar a .scss si usas SASS
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  // --- Estado del modal ---
  mostrarModal = false;
  modalExito = false;      // true = login exitoso, false = error
  modalMensaje = '';

  constructor(
    private fb: FormBuilder,
    private coreAdmin: CoreAdmin,
    private authService: AuthService
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
        this.modalExito = true;
        this.modalMensaje = `Login exitoso. Bienvenido ${respuesta.nombres_completos}`;
        this.mostrarModal = true;

        // Guarda el token, rol y nombre en localStorage
        this.authService.guardarSesion(
          respuesta.token,
          respuesta.rol,
          respuesta.nombres_completos
        );
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.modalExito = false;
        this.modalMensaje = this.obtenerMensajeError(error);
        this.mostrarModal = true;
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;

    // Solo redirige si el login fue exitoso
    if (this.modalExito) {
      this.authService.redirigirSegunRol();
    }
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    // FastAPI manda el detalle en error.error.detail
    if (error.error?.detail) {
      return typeof error.error.detail === 'string'
        ? error.error.detail
        : 'Credenciales inválidas.';
    }
    return 'Ocurrió un error al iniciar sesión. Intenta de nuevo.';
  }
  
}