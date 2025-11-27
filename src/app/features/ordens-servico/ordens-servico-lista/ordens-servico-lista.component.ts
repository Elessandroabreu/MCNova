import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { OrdemServicoService } from '../../../core/services/ordem-servico.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { VeiculoService } from '../../../core/services/veiculo.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { ServicoService } from '../../../core/services/servico.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrdemServico, OrdemServicoRequest, ItemOrdemServicoRequest, Cliente, Veiculo, Produto, Servico, Usuario, StatusOrdemServico, TipoServico, FormaPagamento } from '../../../core/models';
import { formatarData } from '../../../core/utils/formatters.util';

declare var bootstrap: any;

interface ItemLocal {
  tipo: 'produto' | 'servico';
  codigo: number;
  nome: string;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
}

@Component({
  selector: 'app-ordens-servico-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ordens-servico-lista.component.html',
  styleUrl: './ordens-servico-lista.component.scss'
})
export class OrdensServicoListaComponent implements OnInit {
  private ordemServicoService = inject(OrdemServicoService);
  private clienteService = inject(ClienteService);
  private veiculoService = inject(VeiculoService);
  private produtoService = inject(ProdutoService);
  private servicoService = inject(ServicoService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  
  @ViewChild('ordemModal') modalElement!: ElementRef;
  @ViewChild('aprovarModal') aprovarModalElement!: ElementRef;
  private modalInstance: any;
  public aprovarModalInstance: any;
  
  ordens = signal<OrdemServico[]>([]);
  ordensFiltradas = signal<OrdemServico[]>([]);
  clientes = signal<Cliente[]>([]);
  veiculos = signal<Veiculo[]>([]);
  veiculosCliente = signal<Veiculo[]>([]);
  produtos = signal<Produto[]>([]);
  servicos = signal<Servico[]>([]);
  mecanicos = signal<Usuario[]>([]);
  
  isLoading = signal(false);
  isSubmitting = signal(false);
  
  ordemForm!: FormGroup;
  aprovarForm!: FormGroup;
  itens = signal<ItemLocal[]>([]);
  
  produtoSelecionado = signal<number | null>(null);
  quantidadeProduto = signal<number>(1);
  servicoSelecionado = signal<number | null>(null);
  
  ordemParaAprovar = signal<OrdemServico | null>(null);
  
  filtroStatus = signal<StatusOrdemServico | 'TODOS'>('TODOS');
  
  statusOptions = [
    { value: 'TODOS' as const, label: 'Todos', class: 'secondary' },
    { value: StatusOrdemServico.AGUARDANDO, label: 'Aguardando', class: 'warning' },
    { value: StatusOrdemServico.EM_ANDAMENTO, label: 'Em Andamento', class: 'primary' },
    { value: StatusOrdemServico.CONCLUIDA, label: 'Concluída', class: 'success' },
    { value: StatusOrdemServico.CANCELADA, label: 'Cancelada', class: 'danger' }
  ];
  
  tiposServico = [
    { value: TipoServico.ORCAMENTO, label: 'Orçamento' },
    { value: TipoServico.ORDEM_DE_SERVICO, label: 'Ordem de Serviço' }
  ];
  
  formasPagamento = [
    { value: FormaPagamento.DINHEIRO, label: 'Dinheiro' },
    { value: FormaPagamento.CARTAO_CREDITO, label: 'Cartão de Crédito' },
    { value: FormaPagamento.CARTAO_DEBITO, label: 'Cartão de Débito' },
    { value: FormaPagamento.PIX, label: 'PIX' }
  ];
  
  ngOnInit(): void {
    this.inicializarForms();
    this.carregarDados();
  }
  
  ngAfterViewInit(): void {
    if (this.modalElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
    if (this.aprovarModalElement) {
      this.aprovarModalInstance = new bootstrap.Modal(this.aprovarModalElement.nativeElement);
    }
  }
  
  inicializarForms(): void {
    // Form principal de ordem/orçamento
    this.ordemForm = this.fb.group({
      cdCliente: ['', [Validators.required]],
      cdVeiculo: ['', [Validators.required]],
      cdMecanico: ['', [Validators.required]],
      tipoServico: [TipoServico.ORDEM_DE_SERVICO, [Validators.required]],
      dataAgendamento: [''], // ✅ Opcional inicialmente
      observacoes: [''],
      diagnostico: ['']
    });
    
    // ✅ Form para aprovação de orçamento
    this.aprovarForm = this.fb.group({
      dataAgendamento: ['', [Validators.required]]
    });
    
    // Listener para carregar veículos quando selecionar cliente
    this.ordemForm.get('cdCliente')?.valueChanges.subscribe(cdCliente => {
      if (cdCliente) {
        this.carregarVeiculosCliente(cdCliente);
      } else {
        this.veiculosCliente.set([]);
      }
    });
    
    // ✅ Listener para tipo de serviço (OS exige data, orçamento não)
    this.ordemForm.get('tipoServico')?.valueChanges.subscribe(tipo => {
      const dataControl = this.ordemForm.get('dataAgendamento');
      
      if (tipo === TipoServico.ORDEM_DE_SERVICO) {
        dataControl?.setValidators([Validators.required]);
      } else {
        dataControl?.clearValidators();
      }
      
      dataControl?.updateValueAndValidity();
    });
  }
  
  carregarDados(): void {
    this.isLoading.set(true);
    
    Promise.all([
      this.carregarOrdens(),
      this.carregarClientes(),
      this.carregarProdutos(),
      this.carregarServicos(),
      this.carregarMecanicos()
    ]).finally(() => {
      this.isLoading.set(false);
    });
  }
  
  carregarOrdens(): Promise<void> {
    return new Promise((resolve) => {
      // Carrega todas as ordens (não concluídas/canceladas)
      this.ordemServicoService.listarPorStatus(StatusOrdemServico.AGUARDANDO).subscribe({
        next: (ordensAguardando) => {
          this.ordemServicoService.listarPorStatus(StatusOrdemServico.EM_ANDAMENTO).subscribe({
            next: (ordensAndamento) => {
              this.ordens.set([...ordensAguardando, ...ordensAndamento]);
              this.aplicarFiltro();
              resolve();
            },
            error: () => {
              this.ordens.set(ordensAguardando);
              this.aplicarFiltro();
              resolve();
            }
          });
        },
        error: () => resolve()
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
  
  carregarVeiculosCliente(cdCliente: number): void {
    this.veiculoService.listarPorCliente(cdCliente).subscribe({
      next: (veiculos) => {
        this.veiculosCliente.set(veiculos);
      },
      error: () => {
        this.veiculosCliente.set([]);
      }
    });
  }
  
  carregarProdutos(): Promise<void> {
    return new Promise((resolve) => {
      this.produtoService.listarAtivos().subscribe({
        next: (produtos: Produto[]) => {
          this.produtos.set(produtos);
          resolve();
        },
        error: () => resolve()
      });
    });
  }
  
  carregarServicos(): Promise<void> {
    return new Promise((resolve) => {
      this.servicoService.listarAtivos().subscribe({
        next: (servicos) => {
          this.servicos.set(servicos);
          resolve();
        },
        error: () => resolve()
      });
    });
  }
  
  carregarMecanicos(): Promise<void> {
    return new Promise((resolve) => {
      this.usuarioService.listarMecanicos().subscribe({
        next: (mecanicos) => {
          this.mecanicos.set(mecanicos);
          resolve();
        },
        error: () => resolve()
      });
    });
  }
  
  aplicarFiltro(): void {
    let filtradas = this.ordens();
    
    if (this.filtroStatus() !== 'TODOS') {
      filtradas = filtradas.filter(o => o.status === this.filtroStatus());
    }
    
    this.ordensFiltradas.set(filtradas);
  }
  
  alterarFiltroStatus(status: StatusOrdemServico | 'TODOS'): void {
    this.filtroStatus.set(status);
    this.aplicarFiltro();
  }
  
  abrirModalNovo(): void {
    this.ordemForm.reset({
      tipoServico: TipoServico.ORDEM_DE_SERVICO
    });
    
    // ✅ Data padrão: hoje (se for OS)
    const hoje = new Date().toISOString().split('T')[0];
    this.ordemForm.patchValue({
      dataAgendamento: hoje
    });
    
    this.itens.set([]);
    this.produtoSelecionado.set(null);
    this.servicoSelecionado.set(null);
    this.quantidadeProduto.set(1);
    this.modalInstance?.show();
  }
  
  fecharModal(): void {
    this.modalInstance?.hide();
    this.ordemForm.reset();
    this.itens.set([]);
  }
  
  adicionarProduto(): void {
    const cdProduto = this.produtoSelecionado();
    const quantidade = this.quantidadeProduto();
    
    if (!cdProduto || quantidade <= 0) {
      alert('Selecione um produto e quantidade válida');
      return;
    }
    
    const produto = this.produtos().find(p => p.cdProduto === cdProduto);
    if (!produto) return;
    
    if (produto.qtdEstoque < quantidade) {
      alert(`Estoque insuficiente! Disponível: ${produto.qtdEstoque}`);
      return;
    }
    
    const itemExistente = this.itens().find(i => i.tipo === 'produto' && i.codigo === cdProduto);
    
    if (itemExistente) {
      const novosItens = this.itens().map(item => {
        if (item.tipo === 'produto' && item.codigo === cdProduto) {
          const novaQuantidade = item.quantidade + quantidade;
          return { ...item, quantidade: novaQuantidade, vlTotal: novaQuantidade * item.vlUnitario };
        }
        return item;
      });
      this.itens.set(novosItens);
    } else {
      const novoItem: ItemLocal = {
        tipo: 'produto',
        codigo: produto.cdProduto,
        nome: produto.nmProduto,
        quantidade: quantidade,
        vlUnitario: produto.vlVenda,
        vlTotal: quantidade * produto.vlVenda
      };
      this.itens.set([...this.itens(), novoItem]);
    }
    
    this.produtoSelecionado.set(null);
    this.quantidadeProduto.set(1);
  }
  
  adicionarServico(): void {
    const cdServico = this.servicoSelecionado();
    
    if (!cdServico) {
      alert('Selecione um serviço');
      return;
    }
    
    const servico = this.servicos().find(s => s.cdServico === cdServico);
    if (!servico) return;
    
    const itemExistente = this.itens().find(i => i.tipo === 'servico' && i.codigo === cdServico);
    
    if (itemExistente) {
      alert('Serviço já adicionado');
      return;
    }
    
    const novoItem: ItemLocal = {
      tipo: 'servico',
      codigo: servico.cdServico,
      nome: servico.nmServico,
      quantidade: 1,
      vlUnitario: servico.vlServico,
      vlTotal: servico.vlServico
    };
    
    this.itens.set([...this.itens(), novoItem]);
    this.servicoSelecionado.set(null);
  }
  
  removerItem(tipo: 'produto' | 'servico', codigo: number): void {
    this.itens.set(this.itens().filter(i => !(i.tipo === tipo && i.codigo === codigo)));
  }
  
  calcularTotal(): number {
    return this.itens().reduce((total, item) => total + item.vlTotal, 0);
  }
  
  salvar(): void {
    if (this.ordemForm.invalid) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (this.itens().length === 0) {
      alert('Adicione pelo menos um produto ou serviço');
      return;
    }
    
    this.isSubmitting.set(true);
    
    const formValue = this.ordemForm.value;
    
    const itensRequest: ItemOrdemServicoRequest[] = this.itens().map(item => ({
      cdProduto: item.tipo === 'produto' ? item.codigo : undefined,
      cdServico: item.tipo === 'servico' ? item.codigo : undefined,
      quantidade: item.quantidade,
      vlUnitario: item.vlUnitario
    }));
    
    const dados: OrdemServicoRequest = {
      cdCliente: formValue.cdCliente,
      cdVeiculo: formValue.cdVeiculo,
      cdMecanico: formValue.cdMecanico,
      tipoServico: formValue.tipoServico,
      dataAgendamento: formValue.dataAgendamento || undefined, // ✅ Envia data se preenchida
      observacoes: formValue.observacoes || undefined,
      diagnostico: formValue.diagnostico || undefined,
      itens: itensRequest
    };
    
    this.ordemServicoService.criar(dados).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.fecharModal();
        this.carregarOrdens();
        alert('Ordem de serviço criada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao salvar ordem:', error);
        this.isSubmitting.set(false);
        alert(error.error?.message || error.message || 'Erro ao salvar ordem de serviço');
      }
    });
  }
  
  // ✅ NOVO: Abrir modal de aprovação
  abrirModalAprovar(ordem: OrdemServico): void {
    this.ordemParaAprovar.set(ordem);
    
    // Data padrão: hoje
    const hoje = new Date().toISOString().split('T')[0];
    this.aprovarForm.patchValue({
      dataAgendamento: hoje
    });
    
    this.aprovarModalInstance?.show();
  }
  
  // ✅ ATUALIZADO: Aprovar orçamento com data
  aprovarOrcamento(): void {
    if (this.aprovarForm.invalid) {
      alert('Informe a data de agendamento');
      return;
    }
    
    const ordem = this.ordemParaAprovar();
    if (!ordem) return;
    
    const dataAgendamento = this.aprovarForm.get('dataAgendamento')?.value;
    
    this.isSubmitting.set(true);
    
    this.ordemServicoService.aprovarOrcamento(ordem.cdOrdemServico, dataAgendamento).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.aprovarModalInstance?.hide();
        this.carregarOrdens();
        alert('Orçamento aprovado com sucesso! Agendamento criado automaticamente.');
      },
      error: (error) => {
        console.error('Erro ao aprovar:', error);
        this.isSubmitting.set(false);
        alert(error.error?.message || 'Erro ao aprovar orçamento');
      }
    });
  }
  
  concluirOrdem(ordem: OrdemServico): void {
    const formaPagamento = prompt('Forma de pagamento:\n1 - Dinheiro\n2 - Cartão Crédito\n3 - Cartão Débito\n4 - PIX');
    
    if (!formaPagamento) return;
    
    const formas: { [key: string]: FormaPagamento } = {
      '1': FormaPagamento.DINHEIRO,
      '2': FormaPagamento.CARTAO_CREDITO,
      '3': FormaPagamento.CARTAO_DEBITO,
      '4': FormaPagamento.PIX
    };
    
    const forma = formas[formaPagamento];
    
    if (!forma) {
      alert('Forma de pagamento inválida');
      return;
    }
    
    this.ordemServicoService.concluir(ordem.cdOrdemServico, forma).subscribe({
      next: () => {
        this.carregarOrdens();
        alert('Ordem concluída com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao concluir:', error);
        alert(error.error?.message || 'Erro ao concluir ordem');
      }
    });
  }
  
  cancelarOrdem(ordem: OrdemServico): void {
    if (confirm(`Deseja realmente cancelar esta ordem?`)) {
      this.ordemServicoService.cancelar(ordem.cdOrdemServico).subscribe({
        next: () => {
          this.carregarOrdens();
          alert('Ordem cancelada com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao cancelar:', error);
          alert(error.error?.message || 'Erro ao cancelar ordem');
        }
      });
    }
  }
  
  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
  
  getStatusLabel(status: StatusOrdemServico): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj?.label || status;
  }
  
  getStatusClass(status: StatusOrdemServico): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return `bg-${statusObj?.class || 'secondary'}`;
  }
  
  getTipoLabel(tipo: TipoServico): string {
    const tipoObj = this.tiposServico.find(t => t.value === tipo);
    return tipoObj?.label || tipo;
  }
  
  formatarDataHora(data: string): string {
    return formatarData(data);
  }
}