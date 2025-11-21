// src/app/view/estoque/estoque.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Titulo } from '../../componentes/titulo/titulo';
import { Card } from '../../componentes/card/card';
import { PesquisaFiltro } from '../../componentes/pesquisa-filtro/pesquisa-filtro';
import { OptionDropdown } from '../../shared/models/option-dropdown';
import { Tabela } from '../../componentes/tabela/tabela';
import { ModalProduto } from '../../componentes/modal-produto/modal-produto';
import { Loading } from '../../componentes/loading/loading';
import { ProdutoService } from '../../shared/services/produto.service';
import { Produto, ProdutoRequest } from '../../shared/models/produto.model';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule, Titulo, Card, PesquisaFiltro, Tabela, ModalProduto, Loading],
  templateUrl: './estoque.html',
  styleUrl: './estoque.scss',
})
export class Estoque implements OnInit {
  @ViewChild(ModalProduto) modalProduto!: ModalProduto;

  protected produtos: Produto[] = [];
  protected produtosFiltrados: Produto[] = [];
  protected produtoSelecionado?: Produto;
  protected loading: boolean = false;

  protected listaCategorias: OptionDropdown[] = [
    new OptionDropdown('Todas as categorias'),
  ];

  protected listaCabecario: string[] = [
    'Código',
    'Produto',
    'Categoria',
    'Quantidade',
    'Qtd. Mínima',
    'Valor Unit.',
    'Valor Total',
    'Status',
    'Ações',
  ];

  // Contadores
  protected totalProdutos: number = 0;
  protected totalItens: number = 0;
  protected valorEstoque: number = 0;
  protected estoqueBaixo: number = 0;

  constructor(private produtoService: ProdutoService) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.loading = true;
    this.produtoService.listarAtivos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.produtosFiltrados = produtos;
        this.calcularContadores();
        this.extrairCategorias();
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar produtos:', erro);
        alert('Erro ao carregar produtos. Tente novamente.');
        this.loading = false;
      },
    });
  }

  calcularContadores(): void {
    this.totalProdutos = this.produtos.length;
    this.totalItens = this.produtos.reduce((sum, p) => sum + p.qtdEstoque, 0);
    this.valorEstoque = this.produtos.reduce((sum, p) => sum + (p.vlCusto * p.qtdEstoque), 0);
    this.estoqueBaixo = this.produtos.filter((p) => p.qtdEstoque < p.qtdMinimo).length;
  }

  extrairCategorias(): void {
    const categorias = [...new Set(this.produtos.map((p) => p.categoria).filter((c) => c))];
    this.listaCategorias = [
      new OptionDropdown('Todas as categorias'),
      ...categorias.map((c) => new OptionDropdown(c!)),
    ];
  }

  getPesquisa(termo: string): void {
    this.filtrarPorTexto(termo);
  }

  getFiltro(categoria: string): void {
    this.filtrarPorCategoria(categoria);
  }

  filtrarPorTexto(termo: string): void {
    if (!termo) {
      this.produtosFiltrados = this.produtos;
      return;
    }

    termo = termo.toLowerCase();
    this.produtosFiltrados = this.produtos.filter((produto) =>
      produto.nmProduto.toLowerCase().includes(termo)
    );
  }

  filtrarPorCategoria(categoria: string): void {
    if (categoria === 'Todas as categorias') {
      this.produtosFiltrados = this.produtos;
      return;
    }

    this.produtosFiltrados = this.produtos.filter((p) => p.categoria === categoria);
  }

  abrirModalNovo(): void {
    this.produtoSelecionado = undefined;
    setTimeout(() => this.modalProduto.abrir(), 100);
  }

  abrirModalEditar(produto: Produto): void {
    this.produtoSelecionado = produto;
    setTimeout(() => this.modalProduto.abrir(), 100);
  }

  salvarProduto(produtoData: ProdutoRequest): void {
    this.loading = true;

    if (this.produtoSelecionado) {
      // Editar
      this.produtoService.atualizar(this.produtoSelecionado.cdProduto, produtoData).subscribe({
        next: () => {
          alert('Produto atualizado com sucesso!');
          this.modalProduto.fecharModal();
          this.carregarProdutos();
        },
        error: (erro) => {
          console.error('Erro ao atualizar produto:', erro);
          alert('Erro ao atualizar produto. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    } else {
      // Criar novo
      this.produtoService.criar(produtoData).subscribe({
        next: () => {
          alert('Produto cadastrado com sucesso!');
          this.modalProduto.fecharModal();
          this.carregarProdutos();
        },
        error: (erro) => {
          console.error('Erro ao cadastrar produto:', erro);
          alert('Erro ao cadastrar produto. Verifique os dados e tente novamente.');
          this.loading = false;
        },
      });
    }
  }

  deletarProduto(produto: Produto): void {
    if (!confirm(`Deseja realmente deletar o produto ${produto.nmProduto}?`)) {
      return;
    }

    this.loading = true;
    this.produtoService.deletar(produto.cdProduto).subscribe({
      next: () => {
        alert('Produto deletado com sucesso!');
        this.carregarProdutos();
      },
      error: (erro) => {
        console.error('Erro ao deletar produto:', erro);
        alert('Erro ao deletar produto. Tente novamente.');
        this.loading = false;
      },
    });
  }

  getStatusEstoque(produto: Produto): { texto: string; classe: string } {
    if (produto.qtdEstoque === 0) {
      return { texto: 'Zerado', classe: 'bg-danger' };
    }
    if (produto.qtdEstoque < produto.qtdMinimo) {
      return { texto: 'Baixo', classe: 'bg-warning' };
    }
    return { texto: 'Normal', classe: 'bg-success' };
  }

  calcularValorTotal(produto: Produto): number {
    return produto.vlVenda * produto.qtdEstoque;
  }
}