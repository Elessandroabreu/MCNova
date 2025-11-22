// src/app/view/mecanico/mecanico.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Titulo } from '../../componentes/titulo/titulo';
import { Card } from '../../componentes/card/card';
import { InputPesquisa } from '../../componentes/input-pesquisa/input-pesquisa';
import { Tabela } from '../../componentes/tabela/tabela';
import { ModalUsuario } from '../../componentes/modal-usuario/modal-usuario';
import { Loading } from '../../componentes/loading/loading';
import { UsuarioService } from '../../shared/services/usuario.service';
import { Usuario, UsuarioRequest, UserRole } from '../../shared/models/usuario.model';
import { CpfPipe } from '../../shared/pipes/cpf.pipe';
import { TelefonePipe } from '../../shared/pipes/telefone.pipe';

@Component({
  selector: 'app-mecanico',
  standalone: true,
  imports: [CommonModule, Titulo, Card, InputPesquisa, Tabela, ModalUsuario, Loading, CpfPipe, TelefonePipe],
  templateUrl: './mecanico.html',
  styleUrl: './mecanico.scss',
})
export class Mecanico implements OnInit {
  @ViewChild(ModalUsuario) modalUsuario!: ModalUsuario;

  protected mecanicos: Usuario[] = [];
  protected mecanicosFiltrados: Usuario[] = [];
  protected mecanicoSelecionado?: Usuario;
  protected loading: boolean = false;

  protected listaCabecario: string[] = ['Nome', 'CPF', 'Telefone', 'Email', 'Status', 'Ações'];

  protected totalMecanicos: number = 0;
  protected mecanicosAtivos: number = 0;
  protected mecanicosInativos: number = 0;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.carregarMecanicos();
  }

  carregarMecanicos(): void {
    this.loading = true;
    this.usuarioService.listarMecanicos().subscribe({
      next: (mecanicos) => {
        this.mecanicos = mecanicos;
        this.mecanicosFiltrados = mecanicos;
        this.calcularContadores();
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar mecânicos:', erro);
        alert('Erro ao carregar mecânicos. Tente novamente.');
        this.loading = false;
      },
    });
  }

  calcularContadores(): void {
    this.totalMecanicos = this.mecanicos.length;
    this.mecanicosAtivos = this.mecanicos.filter((m) => m.ativo).length;
    this.mecanicosInativos = this.mecanicos.filter((m) => !m.ativo).length;
  }

  filtrarMecanicos(termo: string): void {
    if (!termo) {
      this.mecanicosFiltrados = this.mecanicos;
      return;
    }

    termo = termo.toLowerCase();
    this.mecanicosFiltrados = this.mecanicos.filter(
      (mecanico) =>
        mecanico.nmUsuario.toLowerCase().includes(termo) ||
        mecanico.email.toLowerCase().includes(termo) ||
        mecanico.nuCPF?.toLowerCase().includes(termo)
    );
  }

  abrirModalNovo(): void {
    this.mecanicoSelecionado = undefined;
    setTimeout(() => this.modalUsuario.abrir(), 100);
  }

  abrirModalEditar(mecanico: Usuario): void {
    this.mecanicoSelecionado = mecanico;
    setTimeout(() => this.modalUsuario.abrir(), 100);
  }

  salvarMecanico(mecanicoData: UsuarioRequest): void {
    this.loading = true;

    // Garantir que sempre seja mecânico
    mecanicoData.roles = ['ROLE_MECANICO' as UserRole];

    if (this.mecanicoSelecionado) {
      this.usuarioService.atualizar(this.mecanicoSelecionado.cdUsuario, mecanicoData).subscribe({
        next: () => {
          alert('Mecânico atualizado com sucesso!');
          this.modalUsuario.fecharModal();
          this.carregarMecanicos();
        },
        error: (erro) => {
          console.error('Erro ao atualizar mecânico:', erro);
          alert('Erro ao atualizar mecânico. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    } else {
      this.usuarioService.criar(mecanicoData).subscribe({
        next: () => {
          alert('Mecânico cadastrado com sucesso!');
          this.modalUsuario.fecharModal();
          this.carregarMecanicos();
        },
        error: (erro) => {
          console.error('Erro ao cadastrar mecânico:', erro);
          alert('Erro ao cadastrar mecânico. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    }
  }

  deletarMecanico(mecanico: Usuario): void {
    if (!confirm(`Deseja realmente deletar o mecânico ${mecanico.nmUsuario}?`)) {
      return;
    }

    this.loading = true;
    this.usuarioService.deletar(mecanico.cdUsuario).subscribe({
      next: () => {
        alert('Mecânico deletado com sucesso!');
        this.carregarMecanicos();
      },
      error: (erro) => {
        console.error('Erro ao deletar mecânico:', erro);
        alert('Erro ao deletar mecânico. Tente novamente.');
        this.loading = false;
      },
    });
  }
}