import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// import { CoreProductos, ProductoPayload } from '../../../../services/core-productos';

/**
 * Códigos de IVA vigentes según catálogo del SRI (Ficha técnica factura electrónica).
 * NOTA: el 15% rige desde abril/2024. Si el SRI vuelve a cambiar la tarifa
 * general, solo hay que ajustar esta lista.
 */
interface TarifaIva {
  codigo: string;   // código que exige el SRI en el XML (campo <codigo>)
  porcentaje: number;
  etiqueta: string;
}

@Component({
  selector: 'app-ingreso-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ingreso-productos.html',
  styleUrl: './ingreso-productos.css',
})
export class IngresoProductos {
  form!: FormGroup;
  isLoading = false;
  mensaje = '';
  huboError = false;

  readonly tarifasIva: TarifaIva[] = [
    { codigo: '4', porcentaje: 15, etiqueta: 'IVA 15% (tarifa general)' },
    { codigo: '2', porcentaje: 12, etiqueta: 'IVA 12% (tarifa anterior)' },
    { codigo: '0', porcentaje: 0, etiqueta: 'IVA 0%' },
    { codigo: '7', porcentaje: 0, etiqueta: 'Exento de IVA' },
    { codigo: '6', porcentaje: 0, etiqueta: 'No objeto de impuesto' },
  ];

  readonly unidadesMedida: string[] = [
    'UNIDAD', 'CAJA', 'PAQUETE', 'DOCENA', 'KILOGRAMO', 'GRAMO',
    'LITRO', 'METRO', 'SERVICIO',
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    // private coreProductos: CoreProductos,
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      // --- Identificación del producto (exigido por el SRI en el XML) ---
      codigo_principal: ['', [Validators.required, Validators.maxLength(25)]],
      codigo_auxiliar: ['', [Validators.maxLength(25)]], // opcional para el SRI
      descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],

      // --- Clasificación interna (no la exige el SRI, pero ayuda al inventario) ---
      categoria: ['', [Validators.required]],

      // --- Precios ---
      precio_unitario: ['', [Validators.required, Validators.min(0.01)]],
      descuento_porcentaje: [0, [Validators.min(0), Validators.max(100)]],

      // --- Impuesto (exigido por el SRI) ---
      codigo_iva: ['4', [Validators.required]], // default: 15%

      // --- Unidad de medida (exigido por el SRI) ---
      unidad_medida: ['UNIDAD', [Validators.required]],

      // --- Inventario (control interno, no va al XML del SRI) ---
      stock_inicial: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [0, [Validators.min(0)]],

      // --- Flags SRI ---
      tiene_ice: [false],   // Impuesto a Consumos Especiales, aplica solo a ciertos productos
    });
  }

  get precioConIva(): number {
    const precio = Number(this.form.value.precio_unitario) || 0;
    const descuento = Number(this.form.value.descuento_porcentaje) || 0;
    const codigoIva = this.form.value.codigo_iva;

    const tarifa = this.tarifasIva.find(t => t.codigo === codigoIva);
    const porcentajeIva = tarifa?.porcentaje ?? 0;

    const precioConDescuento = precio - (precio * descuento) / 100;
    return precioConDescuento + (precioConDescuento * porcentajeIva) / 100;
  }

  onSubmit(): void {
    if (this.isLoading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.huboError = true;
      this.mensaje = 'Revisa los datos del formulario.';
      return;
    }

    this.isLoading = true;
    this.mensaje = '';

    const datos = {
      codigo_principal: this.form.value.codigo_principal.trim(),
      codigo_auxiliar: this.form.value.codigo_auxiliar?.trim() || null,
      descripcion: this.form.value.descripcion.trim(),
      categoria: this.form.value.categoria.trim(),
      precio_unitario: Number(this.form.value.precio_unitario),
      descuento_porcentaje: Number(this.form.value.descuento_porcentaje),
      codigo_iva: this.form.value.codigo_iva,
      unidad_medida: this.form.value.unidad_medida,
      stock_inicial: Number(this.form.value.stock_inicial),
      stock_minimo: Number(this.form.value.stock_minimo),
      tiene_ice: this.form.value.tiene_ice,
    };

    // Descomentar cuando exista el servicio/endpoint de productos:
    //
    // this.coreProductos.registrarProducto(datos).subscribe({
    //   next: (respuesta) => {
    //     this.isLoading = false;
    //     this.huboError = false;
    //     this.mensaje = respuesta.mensaje ?? 'Producto registrado correctamente.';
    //     this.form.reset({ codigo_iva: '4', unidad_medida: 'UNIDAD', descuento_porcentaje: 0, stock_inicial: 0, stock_minimo: 0, tiene_ice: false });
    //     this.cdr.detectChanges();
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     this.isLoading = false;
    //     this.huboError = true;
    //     this.mensaje = this.obtenerMensajeError(error);
    //     this.cdr.detectChanges();
    //   },
    // });

    // --- Simulación temporal mientras conectas el backend ---
    console.log('Producto a registrar (SRI-ready):', datos);
    setTimeout(() => {
      this.isLoading = false;
      this.huboError = false;
      this.mensaje = 'Producto registrado correctamente.';
      this.cdr.detectChanges();
    }, 500);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (error.error?.detail) {
      return typeof error.error.detail === 'string'
        ? error.error.detail
        : 'Revisa los datos del formulario.';
    }
    return 'Ocurrió un error al guardar el producto. Intenta de nuevo.';
  }
}