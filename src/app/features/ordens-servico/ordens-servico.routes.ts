import { Routes } from '@angular/router';

export const ORDENS_SERVICO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ordens-servico-lista/ordens-servico-lista.component').then(m => m.OrdensServicoListaComponent)
  }
];
