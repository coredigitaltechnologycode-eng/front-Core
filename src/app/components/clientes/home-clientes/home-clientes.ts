import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-clientes',
  standalone: true,
  imports: [],
  templateUrl: './home-clientes.html',
  styleUrl: './home-clientes.css',
})
export class HomeClientes {

  constructor(private router: Router) {}

  irAIngresoVendedor(ruta: string): void {
    this.router.navigate(["/ingreso-vendedor"]);
  }

}