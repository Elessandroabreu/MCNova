import { Routes } from '@angular/router';

export const VENDAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./vendas-lista/vendas-lista.component').then(m => m.VendasListaComponent)
  }
];
