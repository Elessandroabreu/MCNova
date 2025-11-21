// src/app/view/usuario/usuario.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Titulo } from '../../componentes/titulo/titulo';
import { Card } from '../../componentes/card/card';
import { PesquisaFiltro } from '../../componentes/pesquisa-filtro/pesquisa-filtro';
import { OptionDropdown } from '../../shared/models/option-dropdown';
import { Tabela } from '../../componentes/tabela/tabela';
import { ModalUsuario } from '../../componentes/modal-usuario/modal-usuario';
import { Loading } from '../../componentes/loading/loading';
import { UsuarioService } from '../../shared/services/usuario.service';
import { Usuario, UsuarioRequest, UserRole } from '../../shared/models/usuario.model';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, Titulo, Card, PesquisaFiltro, Tabela, ModalUsuario, Loading],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss',
})
export class UsuarioComponent implements OnInit {  // ⬅️ MUDOU AQUI
  @ViewChild(ModalUsuario) modalUsuario!: ModalUsuario;

  protected usuarios: Usuario[] = [];  // Agora funciona!
  protected usuariosFiltrados: Usuario[] = [];
  protected usuarioSelecionado?: Usuario;
  protected loading: boolean = false;

  protected listFiltro: OptionDropdown[] = [
    new OptionDropdown('Todas as Funções'),
    new OptionDropdown('Administradores'),
    new OptionDropdown('Atendentes'),
    new OptionDropdown('Mecânicos'),
  ];

  protected listaCabecario: string[] = ['Nome', 'Email', 'Telefone', 'CPF', 'Função', 'Ações'];

  protected totalUsuarios: number = 0;
  protected totalAdmins: number = 0;
  protected totalAtendentes: number = 0;
  protected totalMecanicos: number = 0;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.loading = true;
    this.usuarioService.listarAtivos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = usuarios;
        this.calcularContadores();
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar usuários:', erro);
        alert('Erro ao carregar usuários. Tente novamente.');
        this.loading = false;
      },
    });
  }

  calcularContadores(): void {
    this.totalUsuarios = this.usuarios.length;
    this.totalAdmins = this.usuarios.filter((u) => u.roles.includes('ROLE_ADMIN' as UserRole)).length;
    this.totalAtendentes = this.usuarios.filter((u) => u.roles.includes('ROLE_ATENDENTE' as UserRole)).length;
    this.totalMecanicos = this.usuarios.filter((u) => u.roles.includes('ROLE_MECANICO' as UserRole)).length;
  }

  filtrarPorTexto(termo: string): void {
    if (!termo) {
      this.usuariosFiltrados = this.usuarios;
      return;
    }

    termo = termo.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(
      (usuario) =>
        usuario.nmUsuario.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo)
    );
  }

  filtrarPorRole(filtro: string): void {
    if (filtro === 'Todas as Funções') {
      this.usuariosFiltrados = this.usuarios;
      return;
    }

    let role: UserRole;
    
    if (filtro === 'Administradores') {
      role = 'ROLE_ADMIN' as UserRole;
    } else if (filtro === 'Atendentes') {
      role = 'ROLE_ATENDENTE' as UserRole;
    } else if (filtro === 'Mecânicos') {
      role = 'ROLE_MECANICO' as UserRole;
    } else {
      this.usuariosFiltrados = this.usuarios;
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter((usuario) => usuario.roles.includes(role));
  }

  abrirModalNovo(): void {
    this.usuarioSelecionado = undefined;
    setTimeout(() => this.modalUsuario.abrir(), 100);
  }

  abrirModalEditar(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
    setTimeout(() => this.modalUsuario.abrir(), 100);
  }

  salvarUsuario(usuarioData: UsuarioRequest): void {
    this.loading = true;

    if (this.usuarioSelecionado) {
      this.usuarioService.atualizar(this.usuarioSelecionado.cdUsuario, usuarioData).subscribe({
        next: () => {
          alert('Usuário atualizado com sucesso!');
          this.modalUsuario.fecharModal();
          this.carregarUsuarios();
        },
        error: (erro) => {
          console.error('Erro ao atualizar usuário:', erro);
          alert('Erro ao atualizar usuário. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    } else {
      this.usuarioService.criar(usuarioData).subscribe({
        next: () => {
          alert('Usuário cadastrado com sucesso!');
          this.modalUsuario.fecharModal();
          this.carregarUsuarios();
        },
        error: (erro) => {
          console.error('Erro ao cadastrar usuário:', erro);
          alert('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    }
  }

  deletarUsuario(usuario: Usuario): void {
    if (!confirm(`Deseja realmente deletar o usuário ${usuario.nmUsuario}?`)) {
      return;
    }

    this.loading = true;
    this.usuarioService.deletar(usuario.cdUsuario).subscribe({
      next: () => {
        alert('Usuário deletado com sucesso!');
        this.carregarUsuarios();
      },
      error: (erro) => {
        console.error('Erro ao deletar usuário:', erro);
        alert('Erro ao deletar usuário. Tente novamente.');
        this.loading = false;
      },
    });
  }

  getRoleLabel(roles: UserRole[]): string {
    if (roles.includes('ROLE_ADMIN' as UserRole)) return 'Administrador';
    if (roles.includes('ROLE_ATENDENTE' as UserRole)) return 'Atendente';
    if (roles.includes('ROLE_MECANICO' as UserRole)) return 'Mecânico';
    return 'Desconhecido';
  }

  getRoleClass(roles: UserRole[]): string {
    if (roles.includes('ROLE_ADMIN' as UserRole)) return 'bg-primary-mecanica';
    if (roles.includes('ROLE_ATENDENTE' as UserRole)) return 'bg-secondary';
    if (roles.includes('ROLE_MECANICO' as UserRole)) return 'bg-success';
    return 'bg-secondary';
  }
}