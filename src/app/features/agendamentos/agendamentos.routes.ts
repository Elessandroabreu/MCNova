import { Routes } from '@angular/router';

export const AGENDAMENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./agendamentos-lista/agendamentos-lista.component').then(m => m.AgendamentosListaComponent)
  }
];
