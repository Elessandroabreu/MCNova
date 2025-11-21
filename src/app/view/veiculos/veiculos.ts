// src/app/view/veiculos/veiculos.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Titulo } from '../../componentes/titulo/titulo';
import { Card } from '../../componentes/card/card';
import { InputPesquisa } from '../../componentes/input-pesquisa/input-pesquisa';
import { Tabela } from '../../componentes/tabela/tabela';
import { ModalVeiculo } from '../../componentes/modal-veiculo/modal-veiculo';
import { Loading } from '../../componentes/loading/loading';
import { VeiculoService } from '../../shared/services/veiculo.service';
import { Veiculo, VeiculoRequest } from '../../shared/models/veiculo.model';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, Titulo, Card, InputPesquisa, Tabela, ModalVeiculo, Loading],
  templateUrl: './veiculos.html',
  styleUrl: './veiculos.scss',
})
export class Veiculos implements OnInit {
  @ViewChild(ModalVeiculo) modalVeiculo!: ModalVeiculo;

  protected veiculos: Veiculo[] = [];
  protected veiculosFiltrados: Veiculo[] = [];
  protected veiculoSelecionado?: Veiculo;
  protected loading: boolean = false;
  protected colunas: string[] = ['PLACA', 'MARCA', 'MODELO', 'ANO', 'COR', 'CLIENTE', 'AÇÕES'];
  protected totalVeiculos: number = 0;

  constructor(private veiculoService: VeiculoService) {}

  ngOnInit(): void {
    this.carregarVeiculos();
  }

  carregarVeiculos(): void {
    this.loading = true;
    this.veiculoService.listarTodos().subscribe({
      next: (veiculos) => {
        this.veiculos = veiculos;
        this.veiculosFiltrados = veiculos;
        this.totalVeiculos = veiculos.length;
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar veículos:', erro);
        alert('Erro ao carregar veículos. Tente novamente.');
        this.loading = false;
      },
    });
  }

  filtrarVeiculos(termo: string): void {
    if (!termo) {
      this.veiculosFiltrados = this.veiculos;
      return;
    }

    termo = termo.toLowerCase();
    this.veiculosFiltrados = this.veiculos.filter(
      (veiculo) =>
        veiculo.placa.toLowerCase().includes(termo) ||
        veiculo.modelo.toLowerCase().includes(termo) ||
        veiculo.marca.toLowerCase().includes(termo) ||
        veiculo.nmCliente.toLowerCase().includes(termo)
    );
  }

  abrirModalNovo(): void {
    this.veiculoSelecionado = undefined;
    setTimeout(() => this.modalVeiculo.abrir(), 100);
  }

  abrirModalEditar(veiculo: Veiculo): void {
    this.veiculoSelecionado = veiculo;
    setTimeout(() => this.modalVeiculo.abrir(), 100);
  }

  salvarVeiculo(veiculoData: VeiculoRequest): void {
    this.loading = true;

    if (this.veiculoSelecionado) {
      // Editar
      this.veiculoService.atualizar(this.veiculoSelecionado.cdVeiculo, veiculoData).subscribe({
        next: () => {
          alert('Veículo atualizado com sucesso!');
          this.modalVeiculo.fecharModal();
          this.carregarVeiculos();
        },
        error: (erro) => {
          console.error('Erro ao atualizar veículo:', erro);
          alert('Erro ao atualizar veículo. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    } else {
      // Criar novo
      this.veiculoService.criar(veiculoData).subscribe({
        next: () => {
          alert('Veículo cadastrado com sucesso!');
          this.modalVeiculo.fecharModal();
          this.carregarVeiculos();
        },
        error: (erro) => {
          console.error('Erro ao cadastrar veículo:', erro);
          alert('Erro ao cadastrar veículo. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    }
  }

  deletarVeiculo(veiculo: Veiculo): void {
    if (!confirm(`Deseja realmente deletar o veículo ${veiculo.placa}?`)) {
      return;
    }

    this.loading = true;
    this.veiculoService.deletar(veiculo.cdVeiculo).subscribe({
      next: () => {
        alert('Veículo deletado com sucesso!');
        this.carregarVeiculos();
      },
      error: (erro) => {
        console.error('Erro ao deletar veículo:', erro);
        alert('Erro ao deletar veículo. Tente novamente.');
        this.loading = false;
      },
    });
  }
}