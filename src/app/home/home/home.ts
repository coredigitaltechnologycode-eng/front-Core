import { Component } from '@angular/core';
import { LoginComponent } from '../../components/login/login';

@Component({
  selector: 'app-home',
  imports: [LoginComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
