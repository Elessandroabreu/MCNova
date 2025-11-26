// src/app/features/produtos/produtos-lista/produtos-lista.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProdutoService } from '../../../core/services/produto.service';
import { Produto, ProdutoRequest } from '../../../core/models/produto.model';

@Component({
  selector: 'app-produtos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './produtos-lista.component.html',
  styleUrls: ['./produtos-lista.component.scss']
})
export class ProdutosListaComponent implements OnInit {
  produtos: Produto[] = [];
  produtoForm!: FormGroup;
  loading = false;
  erro = '';
  modoEdicao = false;
  mostrarModal = false;

  constructor(
    private produtoService: ProdutoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.inicializarForm();
    this.carregarProdutos();
  }

  inicializarForm(): void {
    this.produtoForm = this.fb.group({
      cdProduto: [null],
      nmProduto: ['', [Validators.required, Validators.maxLength(150)]],
      dsProduto: ['', Validators.maxLength(500)],
      categoria: ['', Validators.maxLength(100)],
      vlCusto: [0, [Validators.required, Validators.min(0.01)]],
      vlVenda: [0, [Validators.required, Validators.min(0.01)]],
      qtdEstoque: [0, [Validators.required, Validators.min(0)]],
      qtdMinimo: [5, [Validators.required, Validators.min(0)]]
    });
  }

  carregarProdutos(): void {
    this.loading = true;
    this.erro = '';

    this.produtoService.listar().subscribe({
      next: (data) => {
        this.produtos = data;
        this.loading = false;
      },
      error: (err) => {
        this.erro = 'Erro ao carregar produtos';
        console.error('Erro ao carregar produtos:', err);
        this.loading = false;
      }
    });
  }

  novo(): void {
    this.modoEdicao = false;
    this.erro = '';
    this.produtoForm.reset({
      cdProduto: null,
      nmProduto: '',
      dsProduto: '',
      categoria: '',
      vlCusto: 0,
      vlVenda: 0,
      qtdEstoque: 0,
      qtdMinimo: 5
    });
    this.mostrarModal = true;
  }

  editar(produto: Produto): void {
    this.modoEdicao = true;
    this.erro = '';
    this.produtoForm.patchValue({
      cdProduto: produto.cdProduto,
      nmProduto: produto.nmProduto,
      dsProduto: produto.dsProduto || '',
      categoria: produto.categoria || '',
      vlCusto: produto.vlCusto,
      vlVenda: produto.vlVenda,
      qtdEstoque: produto.qtdEstoque,
      qtdMinimo: produto.qtdMinimo
    });
    this.mostrarModal = true;
  }

  salvar(): void {
    if (this.produtoForm.invalid) {
      this.erro = 'Preencha todos os campos obrigatórios corretamente';
      Object.keys(this.produtoForm.controls).forEach(key => {
        const control = this.produtoForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    // Validar se preço de venda é maior que custo
    const vlCusto = Number(this.produtoForm.value.vlCusto);
    const vlVenda = Number(this.produtoForm.value.vlVenda);
    
    if (vlVenda <= vlCusto) {
      this.erro = 'Preço de venda deve ser maior que o custo';
      return;
    }

    this.loading = true;
    this.erro = '';

    // Criar objeto tipado corretamente
    const produtoData: ProdutoRequest = {
      nmProduto: this.produtoForm.value.nmProduto,
      dsProduto: this.produtoForm.value.dsProduto || null,
      categoria: this.produtoForm.value.categoria || null,
      vlCusto: vlCusto,
      vlVenda: vlVenda,
      qtdEstoque: Number(this.produtoForm.value.qtdEstoque),
      qtdMinimo: Number(this.produtoForm.value.qtdMinimo)
    };

    const request = this.modoEdicao
      ? this.produtoService.atualizar(this.produtoForm.value.cdProduto!, produtoData)
      : this.produtoService.criar(produtoData);

    request.subscribe({
      next: () => {
        this.mostrarModal = false;
        this.carregarProdutos();
        this.loading = false;
      },
      error: (err) => {
        this.erro = 'Erro ao salvar produto';
        console.error('Erro ao salvar produto:', err);
        this.loading = false;
      }
    });
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir este produto?')) {
      return;
    }

    this.loading = true;
    this.erro = '';

    this.produtoService.deletar(id).subscribe({
      next: () => {
        this.carregarProdutos();
        this.loading = false;
      },
      error: (err) => {
        this.erro = 'Erro ao excluir produto';
        console.error('Erro ao excluir produto:', err);
        this.loading = false;
      }
    });
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.erro = '';
  }

  isInvalid(campo: string): boolean {
    const control = this.produtoForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  calcularMargem(custo: number, venda: number): string {
    if (!custo || !venda || custo === 0) return '0.00';
    const margem = ((venda - custo) / custo) * 100;
    return margem.toFixed(2);
  }

  contarEstoqueBaixo(): number {
    return this.produtos.filter(p => p.qtdEstoque <= p.qtdMinimo).length;
  }
}