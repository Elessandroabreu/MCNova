import { Routes } from '@angular/router';

export const FATURAMENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./faturamento-dashboard/faturamento-dashboard.component').then(m => m.FaturamentoDashboardComponent)
  }
];
