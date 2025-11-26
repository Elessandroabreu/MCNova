import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ProdutoService } from '../../../core/services/produto.service';
import { Produto, ProdutoRequest } from '../../../core/models';
import { formatarData } from '../../../core/utils/formatters.util';

declare var bootstrap: any;

@Component({
  selector: 'app-produtos-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './produtos-lista.component.html',
  styleUrl: './produtos-lista.component.scss'
})
export class ProdutosListaComponent implements OnInit {
  private produtoService = inject(ProdutoService);
  private fb = inject(FormBuilder);
  
  @ViewChild('produtoModal') modalElement!: ElementRef;
  private modalInstance: any;
  
  produtos = signal<Produto[]>([]);
  produtosFiltrados = signal<Produto[]>([]);
  
  isLoading = signal(false);
  isSubmitting = signal(false);
  
  produtoForm!: FormGroup;
  modoEdicao = signal(false);
  produtoEditando = signal<Produto | null>(null);
  
  searchTerm = signal('');
  filtroEstoque = signal<'todos' | 'estoque-baixo'>('todos');
  
  ngOnInit(): void {
    this.inicializarForm();
    this.carregarProdutos();
  }
  
  ngAfterViewInit(): void {
    if (this.modalElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }
  
  inicializarForm(): void {
    this.produtoForm = this.fb.group({
      nmProduto: ['', [Validators.required, Validators.maxLength(120)]],
      dsProduto: ['', [Validators.maxLength(255)]],
      vlPreco: ['', [Validators.required, Validators.min(0)]],
      qtEstoque: ['', [Validators.required, Validators.min(0)]],
      qtEstoqueMinimo: ['', [Validators.min(0)]]
    });
  }
  
  carregarProdutos(): void {
    this.isLoading.set(true);
    
    this.produtoService.listarAtivos().subscribe({
      next: (produtos) => {
        this.produtos.set(produtos);
        this.aplicarFiltro();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  aplicarFiltro(): void {
    const termo = this.searchTerm().toLowerCase();
    let filtrados = this.produtos();
    
    // Filtro de estoque
    if (this.filtroEstoque() === 'estoque-baixo') {
      filtrados = filtrados.filter(p => 
        p.qtEstoqueMinimo !== undefined && 
        p.qtEstoque <= p.qtEstoqueMinimo
      );
    }
    
    // Filtro de busca
    if (termo) {
      filtrados = filtrados.filter(produto =>
        produto.nmProduto.toLowerCase().includes(termo) ||
        produto.dsProduto?.toLowerCase().includes(termo)
      );
    }
    
    this.produtosFiltrados.set(filtrados);
  }
  
  alterarFiltroEstoque(filtro: 'todos' | 'estoque-baixo'): void {
    this.filtroEstoque.set(filtro);
    this.aplicarFiltro();
  }
  
  abrirModalNovo(): void {
    this.modoEdicao.set(false);
    this.produtoEditando.set(null);
    this.produtoForm.reset({
      qtEstoque: 0,
      qtEstoqueMinimo: 10
    });
    this.modalInstance?.show();
  }
  
  abrirModalEditar(produto: Produto): void {
    this.modoEdicao.set(true);
    this.produtoEditando.set(produto);
    
    this.produtoForm.patchValue({
      nmProduto: produto.nmProduto,
      dsProduto: produto.dsProduto || '',
      vlPreco: produto.vlPreco,
      qtEstoque: produto.qtEstoque,
      qtEstoqueMinimo: produto.qtEstoqueMinimo || 0
    });
    
    this.modalInstance?.show();
  }
  
  fecharModal(): void {
    this.modalInstance?.hide();
    this.produtoForm.reset();
  }
  
  salvar(): void {
    if (this.produtoForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }
    
    this.isSubmitting.set(true);
    
    const formValue = this.produtoForm.value;
    const dados: ProdutoRequest = {
      nmProduto: formValue.nmProduto,
      dsProduto: formValue.dsProduto || undefined,
      vlPreco: parseFloat(formValue.vlPreco),
      qtEstoque: parseInt(formValue.qtEstoque),
      qtEstoqueMinimo: formValue.qtEstoqueMinimo ? parseInt(formValue.qtEstoqueMinimo) : undefined
    };
    
    const operacao = this.modoEdicao()
      ? this.produtoService.atualizar(this.produtoEditando()!.cdProduto, dados)
      : this.produtoService.criar(dados);
    
    operacao.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.fecharModal();
        this.carregarProdutos();
      },
      error: (error) => {
        console.error('Erro ao salvar produto:', error);
        this.isSubmitting.set(false);
        alert(error.message || 'Erro ao salvar produto');
      }
    });
  }
  
  confirmarExclusao(produto: Produto): void {
    if (confirm(`Deseja realmente excluir o produto "${produto.nmProduto}"?`)) {
      this.produtoService.deletar(produto.cdProduto).subscribe({
        next: () => {
          this.carregarProdutos();
        },
        error: (error) => {
          console.error('Erro ao excluir produto:', error);
          alert('Erro ao excluir produto');
        }
      });
    }
  }
  
  isEstoqueBaixo(produto: Produto): boolean {
    return produto.qtEstoqueMinimo !== undefined && 
           produto.qtEstoque <= produto.qtEstoqueMinimo;
  }
  
  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.produtoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  
  getFieldError(fieldName: string): string {
    const field = this.produtoForm.get(fieldName);
    
    if (field?.hasError('required')) return 'Campo obrigatório';
    if (field?.hasError('min')) return `Valor mínimo: ${field.errors?.['min'].min}`;
    if (field?.hasError('maxlength')) {
      const max = field.errors?.['maxlength'].requiredLength;
      return `Máximo de ${max} caracteres`;
    }
    
    return '';
  }
  
  marcarCamposComoTocados(): void {
    Object.keys(this.produtoForm.controls).forEach(key => {
      this.produtoForm.get(key)?.markAsTouched();
    });
  }
  
  formatarData(data: string): string {
    return formatarData(data);
  }
}
