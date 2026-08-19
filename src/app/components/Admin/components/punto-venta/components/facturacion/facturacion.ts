import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// import { CoreFacturacion, FacturaPayload } from '../../../../services/core-facturacion';
// import { CoreProductos } from '../../../../services/core-productos';

/** Catálogo de tipos de identificación del comprador según ficha técnica del SRI */
interface TipoIdentificacion {
  codigo: string;
  etiqueta: string;
}

/** Catálogo de formas de pago del SRI (tabla 6, ficha técnica) */
interface FormaPago {
  codigo: string;
  etiqueta: string;
}

/** Producto tal como sale del catálogo (ingreso-productos) */
interface ProductoCatalogo {
  codigo_principal: string;
  descripcion: string;
  precio_unitario: number;
  codigo_iva: string;      // '4' = 15%, '0' = 0%, etc.
  unidad_medida: string;
  stock_disponible: number;
}

/** Una línea dentro de la factura */
interface LineaFactura {
  codigo_principal: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  codigo_iva: string;
  porcentaje_iva: number;
  subtotal: number;
  valor_iva: number;
  total: number;
}

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './facturacion.html',
  styleUrl: './facturacion.css',
})
export class Facturacion {
  form!: FormGroup;
  isLoading = false;
  mensaje = '';
  huboError = false;

  readonly tiposIdentificacion: TipoIdentificacion[] = [
    { codigo: '04', etiqueta: 'RUC' },
    { codigo: '05', etiqueta: 'Cédula' },
    { codigo: '06', etiqueta: 'Pasaporte' },
    { codigo: '07', etiqueta: 'Consumidor Final' },
    { codigo: '08', etiqueta: 'Identificación del Exterior' },
  ];

  readonly formasPago: FormaPago[] = [
    { codigo: '01', etiqueta: 'Sin utilización del sistema financiero (efectivo)' },
    { codigo: '15', etiqueta: 'Compensación de deudas' },
    { codigo: '16', etiqueta: 'Tarjeta de débito' },
    { codigo: '17', etiqueta: 'Dinero electrónico' },
    { codigo: '18', etiqueta: 'Tarjeta prepago' },
    { codigo: '19', etiqueta: 'Tarjeta de crédito' },
    { codigo: '20', etiqueta: 'Otros con utilización del sistema financiero' },
    { codigo: '21', etiqueta: 'Endoso de títulos' },
    
  ];

  /** Catálogo de productos disponibles para buscar/agregar (vendría de Firebase) */
  catalogoProductos: ProductoCatalogo[] = [];
  resultadosBusqueda: ProductoCatalogo[] = [];
  terminoBusqueda = '';

  /** Líneas ya agregadas a la factura actual */
  lineas: LineaFactura[] = [];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    // private coreFacturacion: CoreFacturacion,
    // private coreProductos: CoreProductos,
  ) {
    this.initForm();
    this.cargarCatalogoProductos();
  }

  private initForm(): void {
    this.form = this.fb.group({
      // --- Datos del comprador (exigidos por el SRI) ---
      tipo_identificacion: ['05', [Validators.required]],
      identificacion: ['', [Validators.required]],
      razon_social: ['', [Validators.required, Validators.minLength(3)]],
      direccion: [''],
      correo: ['', [Validators.email]],
      telefono: [''],

      // --- Forma de pago (exigido por el SRI) ---
      forma_pago: ['01', [Validators.required]],

      // --- Producto que se está por agregar ---
      cantidad_a_agregar: [1, [Validators.min(1)]],
    });
  }

  /**
   * Placeholder: reemplazar por la llamada real al backend
   * (GET /clientes/{cedula_cliente}/productos)
   */
  private cargarCatalogoProductos(): void {
    // this.coreProductos.listarProductos(cedulaCliente).subscribe(productos => {
    //   this.catalogoProductos = productos;
    // });

    // --- Datos de ejemplo mientras se conecta el backend ---
    this.catalogoProductos = [
      { codigo_principal: 'PROD-001', descripcion: 'Camiseta algodón M', precio_unitario: 12.50, codigo_iva: '4', unidad_medida: 'UNIDAD', stock_disponible: 40 },
      { codigo_principal: 'PROD-002', descripcion: 'Cuaderno 100 hojas', precio_unitario: 1.75, codigo_iva: '0', unidad_medida: 'UNIDAD', stock_disponible: 120 },
    ];
  }

  // --- Búsqueda de productos ---------------------------------------------

  buscarProducto(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    if (!termino) {
      this.resultadosBusqueda = [];
      return;
    }

    this.resultadosBusqueda = this.catalogoProductos.filter(p =>
      p.descripcion.toLowerCase().includes(termino) ||
      p.codigo_principal.toLowerCase().includes(termino)
    );
  }

  agregarProducto(producto: ProductoCatalogo): void {
    const cantidad = Number(this.form.value.cantidad_a_agregar) || 1;

    if (cantidad > producto.stock_disponible) {
      this.huboError = true;
      this.mensaje = `Stock insuficiente de "${producto.descripcion}". Disponible: ${producto.stock_disponible}.`;
      return;
    }

    const porcentajeIva = this.porcentajeSegunCodigo(producto.codigo_iva);
    const subtotal = producto.precio_unitario * cantidad;
    const valorIva = (subtotal * porcentajeIva) / 100;

    const linea: LineaFactura = {
      codigo_principal: producto.codigo_principal,
      descripcion: producto.descripcion,
      cantidad,
      precio_unitario: producto.precio_unitario,
      descuento: 0,
      codigo_iva: producto.codigo_iva,
      porcentaje_iva: porcentajeIva,
      subtotal,
      valor_iva: valorIva,
      total: subtotal + valorIva,
    };

    this.lineas.push(linea);
    this.terminoBusqueda = '';
    this.resultadosBusqueda = [];
    this.huboError = false;
    this.mensaje = '';
  }

  eliminarLinea(index: number): void {
    this.lineas.splice(index, 1);
  }

  recalcularLinea(index: number): void {
    const linea = this.lineas[index];
    linea.subtotal = linea.precio_unitario * linea.cantidad - linea.descuento;
    linea.valor_iva = (linea.subtotal * linea.porcentaje_iva) / 100;
    linea.total = linea.subtotal + linea.valor_iva;
  }

  private porcentajeSegunCodigo(codigoIva: string): number {
    const tabla: Record<string, number> = { '4': 15, '2': 12, '0': 0, '7': 0, '6': 0 };
    return tabla[codigoIva] ?? 0;
  }

  // --- Totales --------------------------------------------------------

  get subtotalSinImpuestos(): number {
    return this.lineas.reduce((acc, l) => acc + l.subtotal, 0);
  }

  get totalIva(): number {
    return this.lineas.reduce((acc, l) => acc + l.valor_iva, 0);
  }

  get totalFactura(): number {
    return this.subtotalSinImpuestos + this.totalIva;
  }

  get desgloseIvaPorTarifa(): { porcentaje: number; base: number; valor: number }[] {
    const mapa = new Map<number, { base: number; valor: number }>();

    for (const l of this.lineas) {
      const actual = mapa.get(l.porcentaje_iva) ?? { base: 0, valor: 0 };
      actual.base += l.subtotal;
      actual.valor += l.valor_iva;
      mapa.set(l.porcentaje_iva, actual);
    }

    return Array.from(mapa.entries()).map(([porcentaje, datos]) => ({
      porcentaje,
      base: datos.base,
      valor: datos.valor,
    }));
  }

  // --- Emisión de la factura --------------------------------------------

  emitirFactura(): void {
    if (this.isLoading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.huboError = true;
      this.mensaje = 'Revisa los datos del comprador.';
      return;
    }

    if (this.lineas.length === 0) {
      this.huboError = true;
      this.mensaje = 'Agrega al menos un producto a la factura.';
      return;
    }

    this.isLoading = true;
    this.mensaje = '';

    const payload = {
      comprador: {
        tipo_identificacion: this.form.value.tipo_identificacion,
        identificacion: this.form.value.identificacion.trim(),
        razon_social: this.form.value.razon_social.trim(),
        direccion: this.form.value.direccion?.trim() || null,
        correo: this.form.value.correo?.trim() || null,
        telefono: this.form.value.telefono?.trim() || null,
      },
      forma_pago: this.form.value.forma_pago,
      detalles: this.lineas,
      subtotal_sin_impuestos: this.subtotalSinImpuestos,
      total_iva: this.totalIva,
      total: this.totalFactura,
      // El backend debe completar: numero_secuencial, establecimiento, punto_emision,
      // ambiente (pruebas/producción), clave_acceso, y luego firmar y enviar al SRI.
    };

    // Descomentar cuando exista el servicio/endpoint del SRI:
    //
    // this.coreFacturacion.emitirFactura(payload).subscribe({
    //   next: (respuesta) => {
    //     this.isLoading = false;
    //     this.huboError = false;
    //     this.mensaje = `Factura ${respuesta.numero_secuencial} autorizada por el SRI.`;
    //     this.lineas = [];
    //     this.form.reset({ tipo_identificacion: '05', forma_pago: '01', cantidad_a_agregar: 1 });
    //     this.cdr.detectChanges();
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     this.isLoading = false;
    //     this.huboError = true;
    //     this.mensaje = this.obtenerMensajeError(error);
    //     this.cdr.detectChanges();
    //   },
    // });

    // --- Simulación temporal mientras conectas el backend/SRI ---
    console.log('Factura a emitir (SRI-ready):', payload);
    setTimeout(() => {
      this.isLoading = false;
      this.huboError = false;
      this.mensaje = 'Factura generada correctamente (simulación local).';
      this.cdr.detectChanges();
    }, 600);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (error.error?.detail) {
      return typeof error.error.detail === 'string'
        ? error.error.detail
        : 'Revisa los datos de la factura.';
    }
    return 'Ocurrió un error al emitir la factura. Intenta de nuevo.';
  }
}