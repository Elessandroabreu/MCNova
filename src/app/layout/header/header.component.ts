import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  
  currentUser = signal<Usuario | null>(null);
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }
  
  logout(): void {
    if (confirm('Deseja realmente sair do sistema?')) {
      this.authService.logout();
    }
  }
  
  getRoleLabel(roles: string[]): string {
    if (roles.includes('ROLE_ADMIN')) return 'Administrador';
    if (roles.includes('ROLE_ATENDENTE')) return 'Atendente';
    if (roles.includes('ROLE_MECANICO')) return 'Mecânico';
    return 'Usuário';
  }
}
