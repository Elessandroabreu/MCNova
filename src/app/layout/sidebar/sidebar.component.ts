import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'bi-speedometer2',
      route: '/dashboard',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO']
    },
    {
      label: 'Ordens de Serviço',
      icon: 'bi-file-earmark-text',
      route: '/ordens-servico',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO']
    },
    {
      label: 'Agenda',
      icon: 'bi-calendar3',
      route: '/agendamentos',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO']
    },
    {
      label: 'Clientes',
      icon: 'bi-people',
      route: '/clientes',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE']
    },
    {
      label: 'Veículos',
      icon: 'bi-car-front',
      route: '/veiculos',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO']
    },
    {
      label: 'Estoque',
      icon: 'bi-box-seam',
      route: '/produtos',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO']
    },
    {
      label: 'Serviços',
      icon: 'bi-tools',
      route: '/servicos',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE', 'ROLE_MECANICO']
    },
    {
      label: 'Vendas',
      icon: 'bi-cart3',
      route: '/vendas',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE']
    },
    {
      label: 'Orçamentos',
      icon: 'bi-calculator',
      route: '/orcamentos',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE']
    },
    {
      label: 'Usuários',
      icon: 'bi-person-badge',
      route: '/usuarios',
      roles: ['ROLE_ADMIN']
    },
    {
      label: 'Faturamento',
      icon: 'bi-currency-dollar',
      route: '/faturamento',
      roles: ['ROLE_ADMIN', 'ROLE_ATENDENTE']
    }
  ];
  
  // Filtra itens do menu baseado nas roles do usuário
  get visibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => 
      this.authService.hasAnyRole(item.roles)
    );
  }
}
