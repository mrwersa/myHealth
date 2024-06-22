import { Routes } from '@angular/router';
import { HomePage } from './home.page';
import { inject } from '@angular/core';
import { AuthGuard } from '../../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [() => inject(AuthGuard).canActivate()], // Protect all child routes
    children: [
      {
        path: 'activity',
        loadComponent: () => import('../activity/activity.page').then(m => m.ActivityPage),
      },
      {
        path: '',
        redirectTo: '/home/activity',
        pathMatch: 'full',
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'settings',
        loadComponent: () => import('../settings/settings.page').then(m => m.SettingsPage)
      },
    ],
  },
];
