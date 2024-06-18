import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.routes').then(m => m.routes),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'callback',
    loadComponent: () => import('./pages/callback/callback.page').then(m => m.CallbackPage),
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
