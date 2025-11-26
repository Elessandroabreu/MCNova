import { Routes } from '@angular/router';

export const VEICULOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./veiculos-lista/veiculos-lista.component').then(m => m.VeiculosListaComponent)
  }
];
