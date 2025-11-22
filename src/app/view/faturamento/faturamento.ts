// src/app/view/faturamento/faturamento.ts
import { Component, OnInit } from '@angular/core';
import { Titulo } from '../../componentes/titulo/titulo';
import { DropdownBotao } from '../../componentes/dropdown-botao/dropdown-botao';
import { OptionDropdown } from '../../shared/models/option-dropdown';
import { Card } from '../../componentes/card/card';
import { Tabela } from '../../componentes/tabela/tabela';
import { CommonModule } from '@angular/common';
import { FaturamentoService } from '../../shared/services/faturamento.service';
import { Faturamento as FaturamentoModel } from '../../shared/models/venda.model';
import { Loading } from '../../componentes/loading/loading';

@Component({
  selector: 'app-faturamento',
  imports: [Titulo, DropdownBotao, Card, Tabela, CommonModule, Loading],
  templateUrl: './faturamento.html',
  styleUrl: './faturamento.scss',
})
export class FaturamentoView implements OnInit {
  protected loading: boolean = false;
  protected faturamentos: FaturamentoModel[] = [];
  protected totalFaturado: number = 0;
  protected totalServicos: number = 0;
  protected totalProdutos: number = 0;

  protected listaFiltro: OptionDropdown[] = [
    new OptionDropdown('Hoje'),
    new OptionDropdown('Mensal'),
    new OptionDropdown('Anual'),
  ];

  protected valorFiltro: string = 'Hoje';
  protected cabecario: string[] = ['Tipo', 'Cliente', 'Data', 'Forma Pagamento', 'Total'];

  constructor(private faturamentoService: FaturamentoService) {}

  ngOnInit(): void {
    this.carregarFaturamentoDoDia();
  }

  carregarFaturamentoDoDia(): void {
    this.loading = true;
    // ✅ CORRIGIDO: usar listarDoDia e tipar os parâmetros
    this.faturamentoService.listarDoDia().subscribe({
      next: (faturamentos: FaturamentoModel[]) => {
        this.faturamentos = faturamentos;
        this.calcularTotais();
        this.loading = false;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar faturamento:', erro);
        this.loading = false;
      },
    });
  }

  calcularTotais(): void {
    this.totalFaturado = this.faturamentos.reduce((sum, f) => sum + f.vlTotal, 0);
    this.totalServicos = this.faturamentos
      .filter((f) => f.tipoTransacao === 'SERVICO')
      .reduce((sum, f) => sum + f.vlTotal, 0);
    this.totalProdutos = this.faturamentos
      .filter((f) => f.tipoTransacao === 'VENDA')
      .reduce((sum, f) => sum + f.vlTotal, 0);
  }

  getFiltro(valor: string): void {
    this.valorFiltro = valor;
    
    if (valor === 'Hoje') {
      this.carregarFaturamentoDoDia();
    }
  }

  getValorInputFiltro(): string {
    if (this.valorFiltro === 'Anual') {
      return new Date().getFullYear().toString();
    } else if (this.valorFiltro === 'Mensal') {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return meses[new Date().getMonth()];
    } else {
      return 'Hoje';
    }
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}