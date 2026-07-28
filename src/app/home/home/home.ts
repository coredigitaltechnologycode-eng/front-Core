import { Component } from '@angular/core';
import { LoginComponent } from "../../components/login/login";
import { RegistroAdmin } from '../../components/registro-admin/registro-admin';


@Component({
  imports: [RegistroAdmin, LoginComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
