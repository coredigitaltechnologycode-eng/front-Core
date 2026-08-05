import {
  ChangeDetectorRef,
  Component,
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import {
  CoreAdmin,
  RegistroAdminPayload,
} from '../../../../services/core-admin';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './registro-admin.html',
  styleUrl: './registro-admin.css',
})
export class RegistroAdmin {
  formulario: FormGroup;

  cargando = false;
  mensajeExito = '';
  errorGeneral = '';

  mostrarPassword = false;

  /*
   * Se utiliza un solo modal para:
   * - Validaciones del formulario.
   * - Registro exitoso.
   * - Errores del backend.
   */
  mostrarModalValidacion = false;
  modalExito = false;
  modalTitulo = '';
  modalMensaje = '';
  modalDetalles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private coreAdmin: CoreAdmin,
    private cdr: ChangeDetectorRef,
  ) {
    this.formulario = this.fb.group({
      cedula: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{10}$/),
        ],
      ],

      nombres_completos: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
        ],
      ],

      rol: [
        'admin',
        [
          Validators.required,
        ],
      ],

      correo: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      contraseña: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
          ),
        ],
      ],
    });
  }

  get f() {
    return this.formulario.controls;
  }

  get passwordValue(): string {
    return String(
      this.f['contraseña'].value ?? '',
    );
  }

  get requisitosPassword(): {
    texto: string;
    cumplido: boolean;
  }[] {
    const contraseña = this.passwordValue;

    return [
      {
        texto: 'Al menos 8 caracteres',
        cumplido: contraseña.length >= 8,
      },
      {
        texto: 'Una letra mayúscula',
        cumplido: /[A-Z]/.test(contraseña),
      },
      {
        texto: 'Una letra minúscula',
        cumplido: /[a-z]/.test(contraseña),
      },
      {
        texto: 'Un número',
        cumplido: /\d/.test(contraseña),
      },
      {
        texto: 'Un carácter especial',
        cumplido: /[^A-Za-z0-9]/.test(
          contraseña,
        ),
      },
    ];
  }

  campoInvalido(
    nombreCampo: string,
  ): boolean {
    const control =
      this.formulario.get(nombreCampo);

    if (!control) {
      return false;
    }

    return (
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }

  togglePasswordVisibility(): void {
    this.mostrarPassword =
      !this.mostrarPassword;

    this.cdr.detectChanges();
  }

  enviar(): void {
    this.mensajeExito = '';
    this.errorGeneral = '';

    /*
     * Cierra cualquier modal anterior.
     */
    this.mostrarModalValidacion = false;
    this.modalDetalles = [];

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mostrarModalErrores();
      return;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    /*
     * Se mantiene exactamente la forma
     * original de preparar los datos.
     */
    const datos =
      this.formulario.value as RegistroAdminPayload;

    /*
     * Se mantiene la petición original.
     */
    this.coreAdmin
      .registrarAdmin(datos)
      .subscribe({
        next: (respuesta) => {
  this.cargando = false;

  /*
   * Si la petición entra en next, el servidor respondió
   * correctamente con un código HTTP exitoso.
   */
  this.mensajeExito =
    `Administrador ${
      respuesta?.cedula ?? datos.cedula
    } registrado con éxito.`;

  this.modalExito = true;
  this.modalTitulo = '¡Registro exitoso!';
  this.modalMensaje =
    'Usuario registrado correctamente.';
  this.modalDetalles = [];
  this.mostrarModalValidacion = true;

  this.formulario.reset({
    rol: 'admin',
  });

  this.cdr.detectChanges();
},

        error: (err) => {
          this.cargando = false;

          const detalle =
            err?.error?.detail;

          if (
            typeof detalle === 'string'
          ) {
            this.errorGeneral =
              detalle;
          } else if (
            Array.isArray(detalle)
          ) {
            this.errorGeneral =
              detalle
                .map((item: any) => {
                  return (
                    item?.msg ??
                    String(item)
                  );
                })
                .join(' ');
          } else if (
            detalle &&
            typeof detalle === 'object'
          ) {
            this.errorGeneral =
              Object.values(detalle)
                .map((mensaje) =>
                  String(mensaje),
                )
                .join(' ');
          } else {
            this.errorGeneral =
              'Ocurrió un error al conectar con el servidor.';
          }

          /*
           * Abre el mismo modal, pero como error.
           */
          this.modalExito = false;
          this.modalTitulo =
            'No se pudo registrar';
          this.modalMensaje =
            this.errorGeneral;
          this.modalDetalles = [];
          this.mostrarModalValidacion = true;

          this.cdr.detectChanges();
        },
      });
  }

  mostrarModalErrores(): void {
    const errores: string[] = [];

    /*
     * Cédula.
     */
    if (
      this.f['cedula'].hasError(
        'required',
      )
    ) {
      errores.push(
        'La cédula es obligatoria.',
      );
    } else if (
      this.f['cedula'].hasError(
        'pattern',
      )
    ) {
      errores.push(
        'La cédula debe contener exactamente 10 dígitos.',
      );
    }

    /*
     * Nombres completos.
     */
    if (
      this.f['nombres_completos']
        .hasError('required')
    ) {
      errores.push(
        'Los nombres completos son obligatorios.',
      );
    } else if (
      this.f['nombres_completos']
        .hasError('minlength')
    ) {
      errores.push(
        'Los nombres completos deben tener al menos 3 caracteres.',
      );
    }

    /*
     * Rol.
     */
    if (
      this.f['rol'].hasError(
        'required',
      )
    ) {
      errores.push(
        'Debes seleccionar un rol.',
      );
    }

    /*
     * Correo.
     */
    if (
      this.f['correo'].hasError(
        'required',
      )
    ) {
      errores.push(
        'El correo electrónico es obligatorio.',
      );
    } else if (
      this.f['correo'].hasError(
        'email',
      )
    ) {
      errores.push(
        'El correo electrónico no tiene un formato válido. Ejemplo: nombre@empresa.com.',
      );
    }

    /*
     * Contraseña.
     */
    if (
      this.f['contraseña'].hasError(
        'required',
      )
    ) {
      errores.push(
        'La contraseña es obligatoria.',
      );
    } else {
      const requisitosFaltantes =
        this.requisitosPassword
          .filter(
            (requisito) =>
              !requisito.cumplido,
          )
          .map(
            (requisito) =>
              requisito.texto
                .toLowerCase(),
          );

      if (
        requisitosFaltantes.length > 0
      ) {
        errores.push(
          `A la contraseña le falta: ${requisitosFaltantes.join(', ')}.`,
        );
      }
    }

    this.modalExito = false;
    this.modalTitulo =
      'Revisa los datos ingresados';
    this.modalMensaje =
      'Corrige los siguientes campos antes de registrar al administrador.';
    this.modalDetalles = errores;
    this.mostrarModalValidacion = true;

    this.cdr.detectChanges();
  }

  cerrarModalValidacion(): void {
    this.mostrarModalValidacion = false;
    this.modalExito = false;
    this.modalTitulo = '';
    this.modalMensaje = '';
    this.modalDetalles = [];

    this.cdr.detectChanges();
  }
  permitirSoloNumeros(evento: KeyboardEvent): void {
  const tecla = evento.key;

  const teclasPermitidas = [
    'Backspace',
    'Delete',
    'Tab',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
  ];

  if (
    teclasPermitidas.includes(tecla) ||
    evento.ctrlKey ||
    evento.metaKey
  ) {
    return;
  }

  if (!/^\d$/.test(tecla)) {
    evento.preventDefault();
  }
}

soloNumerosCedula(evento: Event): void {
  const input = evento.target as HTMLInputElement;

  const valorLimpio = input.value
    .replace(/\D/g, '')
    .slice(0, 10);

  input.value = valorLimpio;

  this.formulario
    .get('cedula')
    ?.setValue(valorLimpio, {
      emitEvent: false,
    });
}
}