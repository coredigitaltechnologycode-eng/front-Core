import { Routes } from '@angular/router';
import { Home } from './home/home/home';
import { HomeAdmin } from './components/Admin/home-admin/home-admin';
import { authGuardGuard } from './guards/login-guard/auth-guard-guard';

export const routes: Routes = [

    {path:'Home', component: Home},

    {path:"home-admin", component:HomeAdmin, canActivate: [authGuardGuard]},
    {path:'', redirectTo : 'Home', pathMatch:'full'},
    


];

