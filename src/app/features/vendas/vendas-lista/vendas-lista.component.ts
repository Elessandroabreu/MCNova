import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VendaService } from '../../../core/services/venda.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { AuthService } from '../../../core/services/auth.service';
import { Venda, VendaRequest, ItemVendaRequest, Cliente, Produto, FormaPagamento } from '../../../core/models';
import { formatarData } from '../../../core/utils/formatters.util';

declare var bootstrap: any;

interface ItemVendaLocal {
  cdProduto: number;
  produto: Produto;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
}

@Component({
  selector: 'app-vendas-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vendas-lista.component.html',
  styleUrl: './vendas-lista.component.scss'
})
export class VendasListaComponent implements OnInit {
  private vendaService = inject(VendaService);
  private clienteService = inject(ClienteService);
  private produtoService = inject(ProdutoService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  
  @ViewChild('vendaModal') modalElement!: ElementRef;
  private modalInstance: any;
  
  vendas = signal<Venda[]>([]);
  vendasFiltradas = signal<Venda[]>([]);
  clientes = signal<Cliente[]>([]);
  produtos = signal<Produto[]>([]);
  
  isLoading = signal(false);
  isSubmitting = signal(false);
  
  vendaForm!: FormGroup;
  itensVenda = signal<ItemVendaLocal[]>([]);
  produtoSelecionado = signal<number | null>(null);
  quantidadeProduto = signal<number>(1);
  
  searchTerm = signal('');
  
  formasPagamento = [
    { value: FormaPagamento.DINHEIRO, label: 'Dinheiro' },
    { value: FormaPagamento.CARTAO_CREDITO, label: 'Cartão de Crédito' },
    { value: FormaPagamento.CARTAO_DEBITO, label: 'Cartão de Débito' },
    { value: FormaPagamento.PIX, label: 'PIX' }
  ];
  
  ngOnInit(): void {
    this.inicializarForm();
    this.carregarDados();
  }
  
  ngAfterViewInit(): void {
    if (this.modalElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }
  
  inicializarForm(): void {
    this.vendaForm = this.fb.group({
      cdCliente: [''],
      formaPagamento: ['', [Validators.required]]
    });
  }
  
  carregarDados(): void {
    this.isLoading.set(true);
    
    Promise.all([
      this.carregarVendas(),
      this.carregarClientes(),
      this.carregarProdutos()
    ]).finally(() => {
      this.isLoading.set(false);
    });
  }
  
  carregarVendas(): Promise<void> {
    return new Promise((resolve) => {
      this.vendaService.listarTodas().subscribe({
        next: (vendas) => {
          this.vendas.set(vendas);
          this.aplicarFiltro();
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar vendas:', error);
          resolve();
        }
      });
    });
  }
  
  carregarClientes(): Promise<void> {
    return new Promise((resolve) => {
      this.clienteService.listarAtivos().subscribe({
        next: (clientes) => {
          this.clientes.set(clientes);
          resolve();
        },
        error: () => resolve()
      });
    });
  }
  
  carregarProdutos(): Promise<void> {
    return new Promise((resolve) => {
      this.produtoService.listarAtivos().subscribe({
        next: (produtos) => {
          this.produtos.set(produtos);
          resolve();
        },
        error: () => resolve()
      });
    });
  }
  
  aplicarFiltro(): void {
    const termo = this.searchTerm().toLowerCase();
    
    if (!termo) {
      this.vendasFiltradas.set(this.vendas());
      return;
    }
    
    const filtradas = this.vendas().filter(venda =>
      venda.cliente?.nmCliente.toLowerCase().includes(termo) ||
      venda.atendente?.nmUsuario.toLowerCase().includes(termo)
    );
    
    this.vendasFiltradas.set(filtradas);
  }
  
  abrirModalNovo(): void {
    this.vendaForm.reset();
    this.itensVenda.set([]);
    this.produtoSelecionado.set(null);
    this.quantidadeProduto.set(1);
    this.modalInstance?.show();
  }
  
  fecharModal(): void {
    this.modalInstance?.hide();
    this.vendaForm.reset();
    this.itensVenda.set([]);
  }
  
  adicionarProduto(): void {
    const cdProduto = this.produtoSelecionado();
    const quantidade = this.quantidadeProduto();
    
    if (!cdProduto || quantidade <= 0) {
      alert('Selecione um produto e quantidade válida');
      return;
    }
    
    const produto = this.produtos().find(p => p.cdProduto === cdProduto);
    
    if (!produto) {
      alert('Produto não encontrado');
      return;
    }
    
    // Verifica estoque
    if (produto.qtEstoque < quantidade) {
      alert(`Estoque insuficiente! Disponível: ${produto.qtEstoque}`);
      return;
    }
    
    // Verifica se produto já foi adicionado
    const itemExistente = this.itensVenda().find(i => i.cdProduto === cdProduto);
    
    if (itemExistente) {
      // Atualiza quantidade
      const novosItens = this.itensVenda().map(item => {
        if (item.cdProduto === cdProduto) {
          const novaQuantidade = item.quantidade + quantidade;
          return {
            ...item,
            quantidade: novaQuantidade,
            vlTotal: novaQuantidade * item.vlUnitario
          };
        }
        return item;
      });
      
      this.itensVenda.set(novosItens);
    } else {
      // Adiciona novo item
      const novoItem: ItemVendaLocal = {
        cdProduto: produto.cdProduto,
        produto: produto,
        quantidade: quantidade,
        vlUnitario: produto.vlPreco,
        vlTotal: quantidade * produto.vlPreco
      };
      
      this.itensVenda.set([...this.itensVenda(), novoItem]);
    }
    
    // Reset
    this.produtoSelecionado.set(null);
    this.quantidadeProduto.set(1);
  }
  
  removerProduto(cdProduto: number): void {
    this.itensVenda.set(this.itensVenda().filter(i => i.cdProduto !== cdProduto));
  }
  
  calcularTotal(): number {
    return this.itensVenda().reduce((total, item) => total + item.vlTotal, 0);
  }
  
  salvar(): void {
    if (this.vendaForm.invalid) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (this.itensVenda().length === 0) {
      alert('Adicione pelo menos um produto à venda');
      return;
    }
    
    this.isSubmitting.set(true);
    
    const formValue = this.vendaForm.value;
    const usuarioLogado = this.authService.getCurrentUser();
    
    const itens: ItemVendaRequest[] = this.itensVenda().map(item => ({
      cdProduto: item.cdProduto,
      quantidade: item.quantidade,
      vlUnitario: item.vlUnitario
    }));
    
    const dados: VendaRequest = {
      cdCliente: formValue.cdCliente || undefined,
      cdAtendente: usuarioLogado!.cdUsuario,
      formaPagamento: formValue.formaPagamento,
      itens: itens
    };
    
    this.vendaService.criar(dados).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.fecharModal();
        this.carregarVendas();
        alert('Venda realizada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao salvar venda:', error);
        this.isSubmitting.set(false);
        alert(error.message || 'Erro ao salvar venda');
      }
    });
  }
  
  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
  
  getFormaPagamentoLabel(forma: FormaPagamento): string {
    const formaObj = this.formasPagamento.find(f => f.value === forma);
    return formaObj?.label || forma;
  }
  
  formatarData(data: string): string {
    return formatarData(data);
  }
}
