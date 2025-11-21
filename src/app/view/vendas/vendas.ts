// src/app/view/vendas/vendas.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Titulo } from '../../componentes/titulo/titulo';
import { Card } from '../../componentes/card/card';
import { InputPesquisa } from '../../componentes/input-pesquisa/input-pesquisa';
import { Tabela } from '../../componentes/tabela/tabela';
import { ModalVenda } from '../../componentes/modal-venda/modal-venda';
import { Loading } from '../../componentes/loading/loading';
import { VendaService } from '../../shared/services/venda.service';
import { Venda, VendaRequest, FormaPagamento } from '../../shared/models/venda.model';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [CommonModule, Titulo, Card, InputPesquisa, Tabela, ModalVenda, Loading],
  templateUrl: './vendas.html',
  styleUrl: './vendas.scss',
})
export class Vendas implements OnInit {
  @ViewChild(ModalVenda) modalVenda!: ModalVenda;

  protected vendas: Venda[] = [];
  protected vendasFiltradas: Venda[] = [];
  protected loading: boolean = false;
  protected colunas: string[] = ['#', 'CLIENTE', 'ATENDENTE', 'DATA', 'PAGAMENTO', 'TOTAL', 'AÇÕES'];
  
  protected totalVendas: number = 0;
  protected totalFaturado: number = 0;
  protected vendasHoje: number = 0;
  protected totalHoje: number = 0;

  constructor(private vendaService: VendaService) {}

  ngOnInit(): void {
    this.carregarVendas();
    this.carregarTotalDia();
  }

  carregarVendas(): void {
    this.loading = true;
    this.vendaService.listarTodas().subscribe({
      next: (vendas) => {
        this.vendas = vendas;
        this.vendasFiltradas = vendas;
        this.calcularContadores();
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar vendas:', erro);
        alert('Erro ao carregar vendas. Tente novamente.');
        this.loading = false;
      },
    });
  }

  carregarTotalDia(): void {
    this.vendaService.calcularTotalDia().subscribe({
      next: (resultado) => {
        this.totalHoje = resultado.totalDia;
      },
      error: (erro) => {
        console.error('Erro ao carregar total do dia:', erro);
      },
    });
  }

  calcularContadores(): void {
    this.totalVendas = this.vendas.length;
    this.totalFaturado = this.vendas.reduce((sum, v) => sum + v.vlTotal, 0);
    
    const hoje = new Date().toISOString().split('T')[0];
    this.vendasHoje = this.vendas.filter(v => 
      v.dataVenda.startsWith(hoje)
    ).length;
  }

  filtrarVendas(termo: string): void {
    if (!termo) {
      this.vendasFiltradas = this.vendas;
      return;
    }

    termo = termo.toLowerCase();
    this.vendasFiltradas = this.vendas.filter(
      (venda) =>
        venda.nmCliente.toLowerCase().includes(termo) ||
        venda.nmAtendente.toLowerCase().includes(termo)
    );
  }

  abrirModalNova(): void {
    setTimeout(() => this.modalVenda.abrir(), 100);
  }

  salvarVenda(vendaData: VendaRequest): void {
    this.loading = true;

    this.vendaService.criar(vendaData).subscribe({
      next: () => {
        alert('Venda realizada com sucesso!');
        this.modalVenda.fecharModal();
        this.carregarVendas();
        this.carregarTotalDia();
      },
      error: (erro) => {
        console.error('Erro ao realizar venda:', erro);
        alert('Erro ao realizar venda. Verifique os dados e tente novamente.');
        this.loading = false;
      },
    });
  }

  visualizarVenda(venda: Venda): void {
    // TODO: Implementar visualização detalhada da venda
    alert(`Visualizar venda #${venda.cdVenda}`);
  }

  formatarData(data: string): string {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  formatarFormaPagamento(forma: FormaPagamento): string {
    const formas: Record<FormaPagamento, string> = {
      DINHEIRO: 'Dinheiro',
      CARTAO_CREDITO: 'Crédito',
      CARTAO_DEBITO: 'Débito',
      PIX: 'PIX',
    };
    return formas[forma] || forma;
  }

  fecharModal(): void {
    // Método vazio para compatibilidade
  }
}