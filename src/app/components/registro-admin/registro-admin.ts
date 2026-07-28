import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoreAdmin, RegistroAdminPayload } from '../../services/core-admin';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro-admin.html',
  styleUrl: './registro-admin.css',
})
export class RegistroAdmin {

  formulario: FormGroup;

  cargando = false;
  mensajeExito = '';
  errorGeneral = '';

  constructor(
    private fb: FormBuilder,
    private coreAdmin: CoreAdmin,
  ) {
    this.formulario = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombres_completos: ['', [Validators.required, Validators.minLength(3)]],
      rol: ['admin', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  // Getter corto para acceder a los controles desde el template
  get f() {
    return this.formulario.controls;
  }

  enviar(): void {
    this.mensajeExito = '';
    this.errorGeneral = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const datos = this.formulario.value as RegistroAdminPayload;

    this.coreAdmin.registrarAdmin(datos).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        if (respuesta.exito) {
          this.mensajeExito = `Administrador ${respuesta.cedula} registrado con éxito.`;
          this.formulario.reset({ rol: 'admin' });
        } else {
          // Errores de validación devueltos por el backend (ej. cédula duplicada)
          this.errorGeneral = Object.values(respuesta.errores ?? {}).join(' ');
        }
      },
      error: (err) => {
        this.cargando = false;
        this.errorGeneral =
          err?.error?.detail ?? 'Ocurrió un error al conectar con el servidor.';
      },
    });
  }
}