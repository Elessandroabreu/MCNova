import { Routes } from '@angular/router';

export const SERVICOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./servicos-lista/servicos-lista.component').then(m => m.ServicosListaComponent)
  }
];
