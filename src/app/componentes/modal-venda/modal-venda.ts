// src/app/componentes/modal-venda/modal-venda.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VendaRequest, ItemVenda, FormaPagamento } from '../../shared/models/venda.model';
import { Cliente } from '../../shared/models/cliente.model';
import { Produto } from '../../shared/models/produto.model';
import { ClienteService } from '../../shared/services/cliente.service';
import { ProdutoService } from '../../shared/services/produto.service';
import { AuthService } from '../../shared/services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-modal-venda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-venda.html',
  styleUrl: './modal-venda.scss',
})
export class ModalVenda implements OnInit {
  @Output() salvar = new EventEmitter<VendaRequest>();
  @Output() fechar = new EventEmitter<void>();

  protected form!: FormGroup;
  protected submitted: boolean = false;
  protected clientes: Cliente[] = [];
  protected produtos: Produto[] = [];
  protected itensVenda: ItemVenda[] = [];
  
  protected produtoSelecionado: number = 0;
  protected quantidadeSelecionada: number = 1;
  
  private modal: any;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private produtoService: ProdutoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.criarForm();
    this.carregarDados();
  }

  private criarForm(): void {
    this.form = this.fb.group({
      cdCliente: ['', [Validators.required]],
      formaPagamento: ['', [Validators.required]],
      desconto: [0, [Validators.min(0)]],
    });
  }

  private carregarDados(): void {
    // Carregar clientes
    this.clienteService.listarAtivos().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (erro) => console.error('Erro ao carregar clientes:', erro),
    });

    // Carregar produtos
    this.produtoService.listarAtivos().subscribe({
      next: (produtos) => {
        this.produtos = produtos.filter(p => p.qtdEstoque > 0);
      },
      error: (erro) => console.error('Erro ao carregar produtos:', erro),
    });
  }

  adicionarProduto(): void {
    if (!this.produtoSelecionado || this.quantidadeSelecionada <= 0) {
      alert('Selecione um produto e informe a quantidade');
      return;
    }

    const produto = this.produtos.find(p => p.cdProduto === Number(this.produtoSelecionado));
    
    if (!produto) {
      alert('Produto não encontrado');
      return;
    }

    if (this.quantidadeSelecionada > produto.qtdEstoque) {
      alert(`Quantidade indisponível. Estoque atual: ${produto.qtdEstoque}`);
      return;
    }

    // Verificar se o produto já foi adicionado
    const itemExistente = this.itensVenda.find(i => i.cdProduto === produto.cdProduto);
    
    if (itemExistente) {
      itemExistente.quantidade += this.quantidadeSelecionada;
    } else {
      this.itensVenda.push({
        cdProduto: produto.cdProduto,
        quantidade: this.quantidadeSelecionada,
      });
    }

    // Limpar seleção
    this.produtoSelecionado = 0;
    this.quantidadeSelecionada = 1;
  }

  removerProduto(index: number): void {
    this.itensVenda.splice(index, 1);
  }

  getProdutoNome(cdProduto: number): string {
    const produto = this.produtos.find(p => p.cdProduto === cdProduto);
    return produto?.nmProduto || '';
  }

  getProdutoValor(cdProduto: number): string {
    const produto = this.produtos.find(p => p.cdProduto === cdProduto);
    return produto?.vlVenda.toFixed(2) || '0.00';
  }

  getSubtotal(cdProduto: number, quantidade: number): string {
    const produto = this.produtos.find(p => p.cdProduto === cdProduto);
    const subtotal = (produto?.vlVenda || 0) * quantidade;
    return subtotal.toFixed(2);
  }

  calcularTotal(): number {
    return this.itensVenda.reduce((total, item) => {
      const produto = this.produtos.find(p => p.cdProduto === item.cdProduto);
      return total + ((produto?.vlVenda || 0) * item.quantidade);
    }, 0);
  }

  calcularTotalComDesconto(): string {
    const total = this.calcularTotal();
    const desconto = this.form.get('desconto')?.value || 0;
    return (total - desconto).toFixed(2);
  }

  abrir(): void {
    const modalElement = document.getElementById('modalVenda');
    this.modal = new bootstrap.Modal(modalElement);
    this.modal.show();
  }

  fecharModal(): void {
    this.modal?.hide();
    this.form.reset({
      desconto: 0
    });
    this.submitted = false;
    this.itensVenda = [];
    this.produtoSelecionado = 0;
    this.quantidadeSelecionada = 1;
    this.fechar.emit();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (this.itensVenda.length === 0) {
      alert('Adicione pelo menos um produto à venda');
      return;
    }

    const usuario = this.authService.getCurrentUser();
    
    if (!usuario) {
      alert('Usuário não autenticado');
      return;
    }

    const vendaData: VendaRequest = {
      cdCliente: parseInt(this.form.value.cdCliente),
      cdAtendente: usuario.cdUsuario,
      formaPagamento: this.form.value.formaPagamento as FormaPagamento,
      desconto: this.form.value.desconto || 0,
      itens: this.itensVenda,
    };

    this.salvar.emit(vendaData);
  }

  isInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return (control?.invalid && this.submitted) ?? false;
  }
}