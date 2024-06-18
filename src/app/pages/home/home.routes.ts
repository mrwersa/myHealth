import { Routes } from '@angular/router';
import { HomePage } from './home.page';
import { authGuard } from '../../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [authGuard],  // Protect all child routes
    children: [
      {
        path: 'overview',
        loadComponent: () => import('../overview/overview.page').then(m => m.OverviewPage),
      },
      {
        path: '',
        redirectTo: '/home/overview',
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