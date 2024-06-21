import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.routes').then(m => m.routes),
    canActivate: [() => inject(AuthGuard).canActivate()],
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
