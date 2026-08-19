import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Facturacion } from "./components/facturacion/facturacion";
import { IngresoProductos } from "./components/ingreso-productos/ingreso-productos";
import { AuthService } from '../../../../services/auth';

type VistaActiva = 'productos' | 'factura';

@Component({
  selector: 'app-punto-venta',
  standalone: true,
  imports: [CommonModule, Facturacion, IngresoProductos],
  templateUrl: './punto-venta.html',
  styleUrl: './punto-venta.css',
})
export class PuntoVenta implements OnInit {
  vistaActiva: VistaActiva = 'factura';

  nombreUsuario = '';
  rolUsuario = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // El nombre y rol mostrados dependen de quién inició sesión
    // (cliente, vendedor o administrador)
    this.nombreUsuario = localStorage.getItem('nombres_completos') ?? 'Usuario';
    this.rolUsuario = this.formatearRol(localStorage.getItem('rol'));
  }

  mostrarVista(vista: VistaActiva): void {
    this.vistaActiva = vista;
  }

  private formatearRol(rol: string | null): string {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'cliente':
        return 'Cliente';
      case 'vendedor':
        return 'Vendedor';
      default:
        return 'Invitado';
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}