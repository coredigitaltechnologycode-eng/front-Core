import { Routes } from '@angular/router';
import { Home } from './home/home/home';
import { HomeAdmin } from './components/Admin/home-admin/home-admin';
import { IngresoClientes } from './components/Admin/components/ingreso-clientes/ingreso-clientes';
import { authGuardGuard } from './guards/login-guard/auth-guard-guard';
import { RegistroAdmin } from './components/Admin/components/registro-admin/registro-admin';
import { HomeClientes } from './components/clientes/home-clientes/home-clientes';
import { LoginComponent } from './components/login/login'; // 👈 ajusta esta ruta de importación a la real

export const routes: Routes = [

    {path:'Home', component: Home},

    // 👇 Ruta que faltaba — sin esto, cualquier navigate(['/login']) explota
    {path:'login', component: LoginComponent},

    {path:"home-admin", component:HomeAdmin, canActivate: [authGuardGuard], data: { rolesPermitidos: ['admin'] }},
    {path:"registro-clientes", component:IngresoClientes, canActivate: [authGuardGuard], data: { rolesPermitidos: ['admin'] }},
    {path:"registro-admin", component:RegistroAdmin, canActivate: [authGuardGuard], data: { rolesPermitidos: ['admin'] }},
    {path:"home-cliente", component: HomeClientes, canActivate: [authGuardGuard], data: { rolesPermitidos: ['cliente'] }},
    {path:'', redirectTo : 'Home', pathMatch:'full'},

];