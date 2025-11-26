import { Routes } from '@angular/router';

export const PRODUTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./produtos-lista/produtos-lista.component').then(m => m.ProdutosListaComponent)
  }
];
