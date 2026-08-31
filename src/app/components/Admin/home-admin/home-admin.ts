import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from "../../footer/footer";
import { NavBar } from '../../nav-bar/nav-bar';

@Component({
  selector: 'app-home-admin',
  imports: [Footer,NavBar],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.css',
})
export class HomeAdmin {

  constructor(private router: Router) { }

  irARegistroAdmin(): void {

    this.router.navigate(['/registro-admin'])
  }

  irARegistroCliente(): void {
    this.router.navigate(['/registro-clientes'])
  }

  irAPuntoVenta(): void {
    this.router.navigate(['/punto-venta'])
  }

}
