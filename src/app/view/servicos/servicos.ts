// src/app/view/servicos/servicos.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Titulo } from '../../componentes/titulo/titulo';
import { Card } from '../../componentes/card/card';
import { InputPesquisa } from '../../componentes/input-pesquisa/input-pesquisa';
import { Tabela } from '../../componentes/tabela/tabela';
import { ModalServico } from '../../componentes/modal-servico/modal-servico';
import { Loading } from '../../componentes/loading/loading';
import { ServicoService } from '../../shared/services/servico.service';
import { Servico, ServicoRequest } from '../../shared/models/servico.model';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, Titulo, Card, InputPesquisa, Tabela, ModalServico, Loading],
  templateUrl: './servicos.html',
  styleUrl: './servicos.scss',
})
export class Servicos implements OnInit {
  @ViewChild(ModalServico) modalServico!: ModalServico;

  protected servicos: Servico[] = [];
  protected servicosFiltrados: Servico[] = [];
  protected servicoSelecionado?: Servico;
  protected loading: boolean = false;
  protected colunas: string[] = ['SERVIÇO', 'DESCRIÇÃO', 'VALOR', 'TEMPO ESTIMADO', 'AÇÕES'];
  
  protected totalServicos: number = 0;
  protected valorMedio: number = 0;

  constructor(private servicoService: ServicoService) {}

  ngOnInit(): void {
    this.carregarServicos();
  }

  carregarServicos(): void {
    this.loading = true;
    this.servicoService.listarAtivos().subscribe({
      next: (servicos) => {
        this.servicos = servicos;
        this.servicosFiltrados = servicos;
        this.calcularContadores();
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar serviços:', erro);
        alert('Erro ao carregar serviços. Tente novamente.');
        this.loading = false;
      },
    });
  }

  calcularContadores(): void {
    this.totalServicos = this.servicos.length;
    
    if (this.totalServicos > 0) {
      const somaValores = this.servicos.reduce((sum, s) => sum + s.vlServico, 0);
      this.valorMedio = somaValores / this.totalServicos;
    } else {
      this.valorMedio = 0;
    }
  }

  filtrarServicos(termo: string): void {
    if (!termo) {
      this.servicosFiltrados = this.servicos;
      return;
    }

    termo = termo.toLowerCase();
    this.servicosFiltrados = this.servicos.filter(
      (servico) =>
        servico.nmServico.toLowerCase().includes(termo) ||
        servico.dsServico?.toLowerCase().includes(termo)
    );
  }

  abrirModalNovo(): void {
    this.servicoSelecionado = undefined;
    setTimeout(() => this.modalServico.abrir(), 100);
  }

  abrirModalEditar(servico: Servico): void {
    this.servicoSelecionado = servico;
    setTimeout(() => this.modalServico.abrir(), 100);
  }

  salvarServico(servicoData: ServicoRequest): void {
    this.loading = true;

    if (this.servicoSelecionado) {
      // Editar
      this.servicoService.atualizar(this.servicoSelecionado.cdServico, servicoData).subscribe({
        next: () => {
          alert('Serviço atualizado com sucesso!');
          this.modalServico.fecharModal();
          this.carregarServicos();
        },
        error: (erro) => {
          console.error('Erro ao atualizar serviço:', erro);
          alert('Erro ao atualizar serviço. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    } else {
      // Criar novo
      this.servicoService.criar(servicoData).subscribe({
        next: () => {
          alert('Serviço cadastrado com sucesso!');
          this.modalServico.fecharModal();
          this.carregarServicos();
        },
        error: (erro) => {
          console.error('Erro ao cadastrar serviço:', erro);
          alert('Erro ao cadastrar serviço. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    }
  }

  deletarServico(servico: Servico): void {
    if (!confirm(`Deseja realmente deletar o serviço ${servico.nmServico}?`)) {
      return;
    }

    this.loading = true;
    this.servicoService.deletar(servico.cdServico).subscribe({
      next: () => {
        alert('Serviço deletado com sucesso!');
        this.carregarServicos();
      },
      error: (erro) => {
        console.error('Erro ao deletar serviço:', erro);
        alert('Erro ao deletar serviço. Tente novamente.');
        this.loading = false;
      },
    });
  }
}