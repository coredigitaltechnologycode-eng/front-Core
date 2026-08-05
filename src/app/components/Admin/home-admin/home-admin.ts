import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-admin',
  imports: [],
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

}
