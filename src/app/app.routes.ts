import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
 
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  
  
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
    
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      
     
      {
        path: 'clientes',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE'] },
        loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
      },
      
   
      {
        path: 'veiculos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/veiculos/veiculos.routes').then(m => m.VEICULOS_ROUTES)
      },
      
     
      {
        path: 'produtos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/produtos/produtos.routes').then(m => m.PRODUTOS_ROUTES)
      },
      
 
      {
        path: 'servicos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/servicos/servicos.routes').then(m => m.SERVICOS_ROUTES)
      },
      

      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
      },
      
   
      {
        path: 'ordens-servico',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/ordens-servico/ordens-servico.routes').then(m => m.ORDENS_SERVICO_ROUTES)
      },
     
      {
        path: 'agendamentos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/agendamentos/agendamentos.routes').then(m => m.AGENDAMENTOS_ROUTES)
      },
      
      {
        path: 'vendas',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE'] },
        loadChildren: () => import('./features/vendas/vendas.routes').then(m => m.VENDAS_ROUTES)
      },
      
      
      {
        path: 'faturamento',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE'] },
        loadChildren: () => import('./features/faturamento/faturamento.routes').then(m => m.FATURAMENTO_ROUTES)
      }
    ]
  },
  

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
