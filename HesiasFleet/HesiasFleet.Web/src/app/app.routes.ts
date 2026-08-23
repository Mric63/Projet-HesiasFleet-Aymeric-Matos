import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then(m => m.LoginPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardPage)
      },
      {
        path: 'vehicles',
        loadComponent: () =>
          import('./features/vehicles/vehicle-list').then(m => m.VehicleListPage)
      },
      {
        path: 'vehicles/:id',
        loadComponent: () =>
          import('./features/vehicles/vehicle-detail').then(m => m.VehicleDetailPage)
      },
      {
        path: 'parts',
        loadComponent: () =>
          import('./features/parts/part-list').then(m => m.PartListPage)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
