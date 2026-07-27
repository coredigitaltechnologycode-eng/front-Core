import { Routes } from '@angular/router';
import { Home } from './home/home/home';

export const routes: Routes = [

    {path:'Home', component: Home},

    {path:'', redirectTo : 'Home', pathMatch:'full'},


];
