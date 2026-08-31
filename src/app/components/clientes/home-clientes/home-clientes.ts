import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from "../../footer/footer";
import { NavBar } from "../../nav-bar/nav-bar";

@Component({
  selector: 'app-home-clientes',
  standalone: true,
  imports: [Footer, NavBar],
  templateUrl: './home-clientes.html',
  styleUrl: './home-clientes.css',
})
export class HomeClientes {

  constructor(private router: Router) {}

  irAIngresoVendedor(ruta: string): void {
    this.router.navigate(["/ingreso-vendedor"]);
  }

}