import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { CoreCliente, RegistroClientePayload } from '../../../../services/core-cliente';

@Component({
  selector: 'app-ingreso-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ingreso-clientes.html',
  styleUrl: './ingreso-clientes.css',
})
export class IngresoClientes {
  formulario: FormGroup;

  cargando = false;
  mostrarPassword = false;

  // Modal simple de retroalimentación (éxito / error)
  mostrarModal = false;
  modalExito = false;
  modalTitulo = '';
  modalMensaje = '';
  modalDetalles: string[] = [];

  planes = [
    { valor: 'basic', etiqueta: 'Basic' },
    { valor: 'pro', etiqueta: 'Pro' },
    { valor: 'enterprise', etiqueta: 'Enterprise' },
  ];

  constructor(
    private fb: FormBuilder,
    private coreCliente: CoreCliente,
    private cdr: ChangeDetectorRef,
  ) {
    this.formulario = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombres_completos: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      usuario_creado: ['', [Validators.required, Validators.minLength(4)]],
      contraseña_creada: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
        ],
      ],
      plan_seleccionado: ['', [Validators.required]],
    });
  }

  get f() {
    return this.formulario.controls;
  }

  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.formulario.get(nombreCampo);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  soloNumeros(evento: Event, campo: string, maxLength: number): void {
    const input = evento.target as HTMLInputElement;
    const valorLimpio = input.value.replace(/\D/g, '').slice(0, maxLength);
    input.value = valorLimpio;
    this.formulario.get(campo)?.setValue(valorLimpio, { emitEvent: false });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mostrarModalErrores();
      return;
    }

    this.cargando = true;

    const datos = this.formulario.value as RegistroClientePayload;

    this.coreCliente.registrarCliente(datos).subscribe({
      next: (respuesta) => {
        this.cargando = false;

        this.modalExito = true;
        this.modalTitulo = '¡Cliente registrado!';
        this.modalMensaje = `El cliente con cédula ${respuesta?.cedula ?? datos.cedula} fue registrado correctamente.`;
        this.modalDetalles = [];
        this.mostrarModal = true;

        this.formulario.reset({ plan_seleccionado: '' });
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;

        this.modalExito = false;
        this.modalTitulo = 'No se pudo registrar el cliente';
        this.modalDetalles = this.extraerErrores(error);
        this.modalMensaje =
          this.modalDetalles.length > 0
            ? 'Corrige los siguientes campos:'
            : 'Ocurrió un error al conectar con el servidor.';
        this.mostrarModal = true;

        this.cdr.detectChanges();
      },
    });
  }

  private extraerErrores(error: HttpErrorResponse): string[] {
    const detalle = error?.error?.detail;

    if (typeof detalle === 'string') {
      return [detalle];
    }

    if (Array.isArray(detalle)) {
      return detalle.map((item: any) => item?.msg ?? String(item));
    }

    if (detalle && typeof detalle === 'object') {
      return Object.values(detalle).map((mensaje) => String(mensaje));
    }

    return [];
  }

  private mostrarModalErrores(): void {
    const errores: string[] = [];

    if (this.f['cedula'].invalid) {
      errores.push('La cédula debe tener exactamente 10 dígitos.');
    }
    if (this.f['nombres_completos'].invalid) {
      errores.push('Los nombres completos deben tener al menos 3 caracteres.');
    }
    if (this.f['direccion'].invalid) {
      errores.push('La dirección debe tener al menos 5 caracteres.');
    }
    if (this.f['correo'].invalid) {
      errores.push('El correo electrónico no tiene un formato válido.');
    }
    if (this.f['telefono'].invalid) {
      errores.push('El teléfono debe tener exactamente 10 dígitos.');
    }
    if (this.f['usuario_creado'].invalid) {
      errores.push('El usuario debe tener al menos 4 caracteres.');
    }
    if (this.f['contraseña_creada'].invalid) {
      errores.push(
        'La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.',
      );
    }
    if (this.f['plan_seleccionado'].invalid) {
      errores.push('Debes seleccionar un plan.');
    }

    this.modalExito = false;
    this.modalTitulo = 'Revisa los datos ingresados';
    this.modalMensaje = 'Corrige los siguientes campos antes de registrar al cliente:';
    this.modalDetalles = errores;
    this.mostrarModal = true;

    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }
}
