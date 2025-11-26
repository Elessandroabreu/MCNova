import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Rota raiz redireciona para dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  
  // ==================== AUTH ====================
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // ==================== LAYOUT PRINCIPAL (PROTEGIDO) ====================
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      
      // Clientes (ADMIN, ATENDENTE)
      {
        path: 'clientes',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE'] },
        loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
      },
      
      // Veículos (ADMIN, ATENDENTE, MECANICO)
      {
        path: 'veiculos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/veiculos/veiculos.routes').then(m => m.VEICULOS_ROUTES)
      },
      
      // Produtos (ADMIN, ATENDENTE, MECANICO)
      {
        path: 'produtos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/produtos/produtos.routes').then(m => m.PRODUTOS_ROUTES)
      },
      
      // Serviços (ADMIN, ATENDENTE, MECANICO)
      {
        path: 'servicos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/servicos/servicos.routes').then(m => m.SERVICOS_ROUTES)
      },
      
      // Usuários (ADMIN)
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
      },
      
      // Ordens de Serviço (ADMIN, ATENDENTE, MECANICO)
      {
        path: 'ordens-servico',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/ordens-servico/ordens-servico.routes').then(m => m.ORDENS_SERVICO_ROUTES)
      },
      
      // Agendamentos (ADMIN, ATENDENTE, MECANICO)
      {
        path: 'agendamentos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'] },
        loadChildren: () => import('./features/agendamentos/agendamentos.routes').then(m => m.AGENDAMENTOS_ROUTES)
      },
      
      // Vendas (ADMIN, ATENDENTE)
      {
        path: 'vendas',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE'] },
        loadChildren: () => import('./features/vendas/vendas.routes').then(m => m.VENDAS_ROUTES)
      },
      
      // Faturamento (ADMIN, ATENDENTE)
      {
        path: 'faturamento',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE'] },
        loadChildren: () => import('./features/faturamento/faturamento.routes').then(m => m.FATURAMENTO_ROUTES)
      }
    ]
  },
  
  // Rota 404
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
