import { Component, inject, OnInit } from '@angular/core';
import { OptionDropdown } from '../../shared/models/option-dropdown';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { BarraLateral } from '../barra-lateral/barra-lateral';
import { ThemeService } from '../../shared/services/theme.service';
import { DropdownLink } from '../dropdown-link/dropdown-link';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLinkActive, RouterLink, BarraLateral, DropdownLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private theme = inject(ThemeService);
  protected authService = inject(AuthService);
  
  protected nomeUsuario: string = '';
  protected listDropdown: OptionDropdown[] = [];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.nomeUsuario = user.nmUsuario;
        this.setupDropdownOptions();
      }
    });
  }

  private setupDropdownOptions(): void {
    this.listDropdown = [
      {
        label: 'Mudar Tema',
        onClick: () => {
          this.theme.toggleTheme();
        },
      },
      {
        label: 'Logout',
        onClick: () => {
          this.authService.logout();
        },
      },
    ];
  }
}