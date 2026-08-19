import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CoreVendedor, RegistroVendedorPayload } from '../../../../services/core-vendedor';
import { AuthService } from '../../../../services/auth';
 // ajusta el path real

@Component({
  selector: 'app-ingreso-vendedor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ingreso-vendedor.html',
  styleUrl: './ingreso-vendedor.css',
})
export class IngresoVendedor {
  form!: FormGroup;
  isLoading = false;
  mensaje = '';
  huboError = false;

  constructor(
    private fb: FormBuilder,
    private coreVendedor: CoreVendedor,
    private authService: AuthService,   // 👈 usas el que ya tienes
    private cdr: ChangeDetectorRef,
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombres_completos: ['', [Validators.required, Validators.minLength(3)]],
      fecha_ingreso: ['', [Validators.required]],
      tipo_contrato: ['', [Validators.required]],
      fecha_nacimiento: ['', [Validators.required]],
      salario: ['', [Validators.required, Validators.min(0.01)]],
      usuario_creado: ['', [Validators.required, Validators.minLength(4)]],
      contraseña_creada: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.isLoading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const cedulaCliente = this.authService.obtenerCedula();
    if (!cedulaCliente) {
      this.huboError = true;
      this.mensaje = 'Tu sesión expiró. Vuelve a iniciar sesión.';
      return;
    }

    this.isLoading = true;
    this.mensaje = '';

    const datos: RegistroVendedorPayload = {
      cedula: this.form.value.cedula,
      nombres_completos: this.form.value.nombres_completos,
      tipo_contrato: this.form.value.tipo_contrato,
      salario: this.form.value.salario,
      usuario_creado: this.form.value.usuario_creado,
      contraseña_creada: this.form.value.contraseña_creada,
      fecha_ingreso: this.aFormatoBackend(this.form.value.fecha_ingreso),
      fecha_nacimiento: this.aFormatoBackend(this.form.value.fecha_nacimiento),
    };

    this.coreVendedor.registrarVendedor(cedulaCliente, datos).subscribe({
      next: (respuesta) => {
        this.isLoading = false;
        this.huboError = false;
        this.mensaje = respuesta.mensaje ?? 'Colaborador registrado correctamente.';
        this.form.reset();
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.huboError = true;
        this.mensaje = this.obtenerMensajeError(error);
        this.cdr.detectChanges();
      },
    });
  }

  private aFormatoBackend(fechaInput: string): string {
    const [anio, mes, dia] = fechaInput.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (error.error?.detail) {
      return typeof error.error.detail === 'string'
        ? error.error.detail
        : 'Revisa los datos del formulario.';
    }
    return 'Ocurrió un error al guardar el registro. Intenta de nuevo.';
  }
}