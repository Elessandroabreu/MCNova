import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./clientes-lista/clientes-lista.component').then(m => m.ClientesListaComponent)
  }
];
