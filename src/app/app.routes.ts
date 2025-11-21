// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Dashboard } from './view/dashboard/dashboard';
import { Login } from './view/login/login';
import { NotFound } from './view/not-found/not-found';
import { OrdensServico } from './view/ordens-servico/ordens-servico';
import { Agenda } from './view/agenda/agenda';
import { Clientes } from './view/clientes/clientes';
import { Estoque } from './view/estoque/estoque';
import { Orcamento } from './view/orcamento/orcamento';
import { Usuario } from './view/usuario/usuario';  // ✅ CORRIGIDO
import { Mecanico } from './view/mecanico/mecanico';
import { Faturamento } from './view/faturamento/faturamento';
import { Veiculos } from './view/veiculos/veiculos';
import { Servicos } from './view/servicos/servicos';
import { Vendas } from './view/vendas/vendas';
import { AuthCallback } from './view/auth-callback/auth-callback..component';
import { authGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'auth/callback', component: AuthCallback },
  { 
    path: 'home', 
    component: Dashboard,
    canActivate: [authGuard]
  },
  { 
    path: 'ordens', 
    component: OrdensServico,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO'])]
  },
  { 
    path: 'agenda', 
    component: Agenda,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN', 'ROLE_ATENDENTE'])]
  },
  { 
    path: 'clientes', 
    component: Clientes,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN', 'ROLE_ATENDENTE'])]
  },
  { 
    path: 'veiculos', 
    component: Veiculos,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN', 'ROLE_ATENDENTE'])]
  },
  { 
    path: 'estoque', 
    component: Estoque,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN', 'ROLE_ATENDENTE'])]
  },
  { 
    path: 'servicos', 
    component: Servicos,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN', 'ROLE_ATENDENTE'])]
  },
  { 
    path: 'vendas', 
    component: Vendas,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN', 'ROLE_ATENDENTE'])]
  },
  { 
    path: 'orcamento', 
    component: Orcamento,
    canActivate: [authGuard]
  },
  { 
    path: 'usuario', 
    component: Usuario,  // ✅ CORRIGIDO
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
  },
  { 
    path: 'mecanico', 
    component: Mecanico,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN', 'ROLE_ATENDENTE'])]
  },
  { 
    path: 'faturamento', 
    component: Faturamento,
    canActivate: [authGuard, roleGuard(['ROLE_ADMIN', 'ROLE_ATENDENTE'])]
  },
  { path: '**', component: NotFound },
];