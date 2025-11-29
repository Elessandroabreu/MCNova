// src/app/features/ordens-servico/ordens-servico-lista/ordens-servico-lista.component.ts
import { Component, inject, OnInit, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { OrdemServicoService } from '../../../core/services/ordem-servico.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { VeiculoService } from '../../../core/services/veiculo.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { ServicoService } from '../../../core/services/servico.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { OrdemServico, OrdemServicoRequest, ItemOrdemServicoRequest, Cliente, Veiculo, Produto, Servico, Usuario, Status, TipoOrdemOrcamento, FormaPagamento } from '../../../core/models';

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
  private fb = inject(FormBuilder);
  
  @ViewChild('ordemModal') modalElement!: ElementRef;
  @ViewChild('aprovarModal') aprovarModalElement!: ElementRef;
  @ViewChild('editarModal') editarModalElement!: ElementRef;
  @ViewChild('concluirModal') concluirModalElement!: ElementRef;
  
  private modalInstance: any;
  public aprovarModalInstance: any;
  public editarModalInstance: any;
  public concluirModalInstance: any;
  
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
  editarForm!: FormGroup;
  concluirForm!: FormGroup;
  itens = signal<ItemLocal[]>([]);
  
  produtoSelecionado = signal<number | null>(null);
  quantidadeProduto = signal<number>(1);
  servicoSelecionado = signal<number | null>(null);
  
  ordemParaAprovar = signal<OrdemServico | null>(null);
  ordemParaEditar = signal<OrdemServico | null>(null);
  ordemParaConcluir = signal<OrdemServico | null>(null);
  
  dropdownAbertoId = signal<number | null>(null);
  filtroStatus = signal<Status | 'TODOS'>('TODOS');
  
  statusOptions = [
    { value: 'TODOS' as const, label: 'Todos', class: 'secondary' },
    { value: Status.AGENDADO, label: 'Aguardando', class: 'warning' },
    { value: Status.EM_ANDAMENTO, label: 'Em Andamento', class: 'primary' },
    { value: Status.CONCLUIDO, label: 'Concluída', class: 'success' },
    { value: Status.CANCELADO, label: 'Cancelada', class: 'danger' }
  ];
  
  statusDropdownOptions = [
    { value: Status.AGENDADO, label: 'Aguardando', class: 'warning', icon: 'clock' },
    { value: Status.EM_ANDAMENTO, label: 'Em Andamento', class: 'primary', icon: 'play-circle' },
    { value: Status.CONCLUIDO, label: 'Concluída', class: 'success', icon: 'check-circle' },
    { value: Status.CANCELADO, label: 'Cancelada', class: 'danger', icon: 'x-circle' }
  ];
  
  tiposServico = [
    { value: TipoOrdemOrcamento.ORCAMENTO, label: 'Orçamento' },
    { value: TipoOrdemOrcamento.ORDEM_DE_SERVICO, label: 'Ordem de Serviço' }
  ];
  
  formasPagamento = [
    { value: FormaPagamento.DINHEIRO, label: 'Dinheiro' },
    { value: FormaPagamento.PIX, label: 'PIX' },
    { value: FormaPagamento.CARTAO_CREDITO, label: 'Cartão de Crédito' },
    { value: FormaPagamento.CARTAO_DEBITO, label: 'Cartão de Débito' }
  ];
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.status-dropdown-container')) {
      this.dropdownAbertoId.set(null);
    }
  }
  
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
    if (this.editarModalElement) {
      this.editarModalInstance = new bootstrap.Modal(this.editarModalElement.nativeElement);
    }
    if (this.concluirModalElement) {
      this.concluirModalInstance = new bootstrap.Modal(this.concluirModalElement.nativeElement);
    }
  }
  
  inicializarForms(): void {
    // ✅ CORRIGIDO: tipoOrdemOrcamento em vez de TipoOrdemOrcamento
    this.ordemForm = this.fb.group({
      cdCliente: ['', [Validators.required]],
      cdVeiculo: ['', [Validators.required]],
      cdMecanico: ['', [Validators.required]],
      tipoOrdemOrcamento: [TipoOrdemOrcamento.ORDEM_DE_SERVICO, [Validators.required]],
      dataAgendamento: [''],
      vlMaoObraExtra: [0],  // ✅ ADICIONADO
      diagnostico: ['']
    });
    
    this.aprovarForm = this.fb.group({
      dataAgendamento: ['', [Validators.required]]
    });
    
    this.editarForm = this.fb.group({
      diagnostico: [''],
      vlMaoObraExtra: [0]  // ✅ ADICIONADO
    });
    
    this.concluirForm = this.fb.group({
      formaPagamento: ['', [Validators.required]]
    });
    
    this.ordemForm.get('cdCliente')?.valueChanges.subscribe(cdCliente => {
      if (cdCliente) {
        this.carregarVeiculosCliente(cdCliente);
      } else {
        this.veiculosCliente.set([]);
      }
    });
    
    // ✅ CORRIGIDO: validação dinâmica de dataAgendamento
    this.ordemForm.get('tipoOrdemOrcamento')?.valueChanges.subscribe(tipo => {
      const dataControl = this.ordemForm.get('dataAgendamento');
      if (tipo === TipoOrdemOrcamento.ORDEM_DE_SERVICO) {
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
  
  // ✅ CORRIGIDO: Método separado sem finally
  carregarOrdens(): Promise<void> {
    return new Promise((resolve) => {
      Promise.all([
        this.ordemServicoService.listarPorStatus(Status.AGENDADO).toPromise(),
        this.ordemServicoService.listarPorStatus(Status.EM_ANDAMENTO).toPromise(),
        this.ordemServicoService.listarPorStatus(Status.CONCLUIDO).toPromise(),
        this.ordemServicoService.listarPorStatus(Status.CANCELADO).toPromise(),
        this.ordemServicoService.listarOrcamentosPendentes().toPromise()
      ]).then(([aguardando, emAndamento, concluidas, canceladas, orcamentos]) => {
        const todasOrdens = [
          ...(aguardando || []),
          ...(emAndamento || []),
          ...(concluidas || []),
          ...(canceladas || []),
          ...(orcamentos || [])
        ];
        
        console.log('📦 Ordens carregadas:', todasOrdens.length);
        this.ordens.set(todasOrdens);
        this.aplicarFiltro();
        resolve();
      }).catch((error) => {
        console.error('❌ Erro ao carregar ordens:', error);
        resolve();
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
        next: (produtos) => {
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
  
  alterarFiltroStatus(status: Status | 'TODOS'): void {
    this.filtroStatus.set(status);
    this.aplicarFiltro();
  }
  
  // ==================== DROPDOWN DE STATUS ====================
  
  toggleDropdownStatus(ordemId: number, event: Event): void {
    event.stopPropagation();
    
    if (this.dropdownAbertoId() === ordemId) {
      this.dropdownAbertoId.set(null);
    } else {
      this.dropdownAbertoId.set(ordemId);
      
      setTimeout(() => {
        const target = event.target as HTMLElement;
        const badge = target.closest('.status-clickable') as HTMLElement;
        const dropdown = target.closest('.status-dropdown-container')?.querySelector('.status-dropdown-menu') as HTMLElement;
        
        if (badge && dropdown) {
          const rect = badge.getBoundingClientRect();
          dropdown.style.top = `${rect.bottom + 4}px`;
          dropdown.style.left = `${rect.left}px`;
        }
      }, 0);
    }
  }
  
  isDropdownAberto(ordemId: number): boolean {
    return this.dropdownAbertoId() === ordemId;
  }
  
  // ✅ CORRIGIDO: Lógica de mudança de status
  mudarStatus(ordem: OrdemServico, novoStatus: Status, event: Event): void {
    event.stopPropagation();
    this.dropdownAbertoId.set(null);
    
    if (ordem.status === novoStatus) {
      return;
    }
    
    // ✅ CONCLUIR: Abre modal de pagamento
    if (novoStatus === Status.CONCLUIDO) {
      this.abrirModalConcluir(ordem);
      return;
    }
    
    // ✅ INICIAR: De AGENDADO → EM_ANDAMENTO
    if (novoStatus === Status.EM_ANDAMENTO && ordem.status === Status.AGENDADO) {
      this.iniciarOrdem(ordem);
      return;
    }
    
    // ✅ CANCELAR
    if (novoStatus === Status.CANCELADO) {
      this.cancelarOrdem(ordem);
      return;
    }
    
    alert('Esta mudança de status não é permitida.');
  }
  
  // ==================== AÇÕES DE STATUS ====================
  
  iniciarOrdem(ordem: OrdemServico): void {
    if (!confirm(`Deseja iniciar a Ordem de Serviço #${ordem.cdOrdemServico}?`)) {
      return;
    }
    
    console.log('▶️ Iniciando ordem:', ordem.cdOrdemServico);
    this.isLoading.set(true);
    
    this.ordemServicoService.iniciar(ordem.cdOrdemServico).subscribe({
      next: () => {
        console.log('✅ Ordem iniciada');
        this.carregarOrdens().then(() => {
          this.isLoading.set(false);
          alert('✅ Ordem de serviço iniciada com sucesso!');
        });
      },
      error: (error) => {
        console.error('❌ Erro ao iniciar:', error);
        this.isLoading.set(false);
        alert('❌ ' + (error.error?.message || 'Erro ao iniciar ordem'));
      }
    });
  }
  
  abrirModalConcluir(ordem: OrdemServico): void {
    this.ordemParaConcluir.set(ordem);
    this.concluirForm.patchValue({
      formaPagamento: FormaPagamento.PIX
    });
    this.concluirModalInstance?.show();
  }
  
  concluirOrdem(): void {
    if (this.concluirForm.invalid) {
      alert('Selecione a forma de pagamento');
      return;
    }
    
    const ordem = this.ordemParaConcluir();
    if (!ordem) return;
    
    const formaPagamento = this.concluirForm.get('formaPagamento')?.value;
    
    console.log('✅ Concluindo ordem:', ordem.cdOrdemServico, 'Pagamento:', formaPagamento);
    this.isSubmitting.set(true);
    
    this.ordemServicoService.concluir(ordem.cdOrdemServico, formaPagamento).subscribe({
      next: () => {
        console.log('✅ Ordem concluída');
        this.isSubmitting.set(false);
        this.concluirModalInstance?.hide();
        this.carregarOrdens();
        alert('✅ Ordem concluída com sucesso! Faturamento gerado automaticamente.');
      },
      error: (error) => {
        console.error('❌ Erro ao concluir:', error);
        this.isSubmitting.set(false);
        alert('❌ ' + (error.error?.message || 'Erro ao concluir ordem'));
      }
    });
  }
  
  cancelarOrdem(ordem: OrdemServico): void {
    if (!confirm(`⚠️ Deseja realmente cancelar esta ordem? As peças serão devolvidas ao estoque.`)) {
      return;
    }
    
    console.log('❌ Cancelando ordem:', ordem.cdOrdemServico);
    this.isLoading.set(true);
    
    this.ordemServicoService.cancelar(ordem.cdOrdemServico).subscribe({
      next: () => {
        console.log('✅ Ordem cancelada');
        this.carregarOrdens().then(() => {
          this.isLoading.set(false);
          alert('✅ Ordem cancelada com sucesso! Peças devolvidas ao estoque.');
        });
      },
      error: (error) => {
        console.error('❌ Erro ao cancelar:', error);
        this.isLoading.set(false);
        alert('❌ ' + (error.error?.message || 'Erro ao cancelar ordem'));
      }
    });
  }
  
  // ==================== CRIAR ORDEM ====================
  
  abrirModalNovo(): void {
    this.ordemForm.reset({
      tipoOrdemOrcamento: TipoOrdemOrcamento.ORDEM_DE_SERVICO,
      vlMaoObraExtra: 0
    });
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
        vlUnitario: produto.vlProduto,
        vlTotal: quantidade * produto.vlProduto
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
    const totalItens = this.itens().reduce((total, item) => total + item.vlTotal, 0);
    const maoObraExtra = this.ordemForm.get('vlMaoObraExtra')?.value || 0;
    return totalItens + maoObraExtra;
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
    
    // ✅ CORRIGIDO: Enviar vlUnitario
    const itensRequest: ItemOrdemServicoRequest[] = this.itens().map(item => ({
      cdProduto: item.tipo === 'produto' ? item.codigo : undefined,
      cdServico: item.tipo === 'servico' ? item.codigo : undefined,
      quantidade: item.quantidade,
      vlUnitario: item.vlUnitario  // ✅ ADICIONADO
    }));
    
    const dados: OrdemServicoRequest = {
      cdCliente: formValue.cdCliente,
      cdVeiculo: formValue.cdVeiculo,
      cdMecanico: formValue.cdMecanico,
      tipoOrdemOrcamento: formValue.tipoOrdemOrcamento,
      dataAgendamento: formValue.dataAgendamento || undefined,
      vlMaoObraExtra: parseFloat(formValue.vlMaoObraExtra) || undefined,  // ✅ ADICIONADO
      diagnostico: formValue.diagnostico || undefined,
      itens: itensRequest
    };
    
    console.log('📤 Enviando ordem:', dados);
    
    this.ordemServicoService.criar(dados).subscribe({
      next: () => {
        console.log('✅ Ordem criada');
        this.isSubmitting.set(false);
        this.fecharModal();
        this.carregarOrdens();
        alert('✅ Ordem de serviço criada com sucesso!');
      },
      error: (error) => {
        console.error('❌ Erro ao salvar:', error);
        this.isSubmitting.set(false);
        alert('❌ ' + (error.error?.message || error.message || 'Erro ao salvar ordem de serviço'));
      }
    });
  }
  
  // ==================== APROVAR ORÇAMENTO ====================
  
  abrirModalAprovar(ordem: OrdemServico): void {
    this.ordemParaAprovar.set(ordem);
    const hoje = new Date().toISOString().split('T')[0];
    this.aprovarForm.patchValue({
      dataAgendamento: hoje
    });
    this.aprovarModalInstance?.show();
  }
  
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
        alert('✅ Orçamento aprovado! Agendamento criado automaticamente.');
      },
      error: (error) => {
        console.error('Erro ao aprovar:', error);
        this.isSubmitting.set(false);
        alert('❌ ' + (error.error?.message || 'Erro ao aprovar orçamento'));
      }
    });
  }
  
  // ==================== EDITAR ORDEM ====================
  
  abrirModalEditar(ordem: OrdemServico): void {
    this.ordemParaEditar.set(ordem);
    this.editarForm.patchValue({
      diagnostico: ordem.diagnostico || '',
      vlMaoObraExtra: ordem.vlMaoObraExtra || 0
    });
    this.editarModalInstance?.show();
  }
  
  salvarEdicao(): void {
    const ordem = this.ordemParaEditar();
    if (!ordem) return;
    
    this.isSubmitting.set(true);
    const formValue = this.editarForm.value;
    
    const dados: OrdemServicoRequest = {
      cdCliente: ordem.cdCliente!,
      cdVeiculo: ordem.cdVeiculo!,
      cdMecanico: ordem.cdMecanico!,
      tipoOrdemOrcamento: ordem.tipoOrdemOrcamento,
      diagnostico: formValue.diagnostico || undefined,
      vlMaoObraExtra: parseFloat(formValue.vlMaoObraExtra) || undefined,
      itens: []
    };
    
    this.ordemServicoService.atualizar(ordem.cdOrdemServico, dados).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.editarModalInstance?.hide();
        this.carregarOrdens();
        alert('✅ Ordem atualizada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao atualizar:', error);
        this.isSubmitting.set(false);
        alert('❌ ' + (error.error?.message || 'Erro ao atualizar ordem'));
      }
    });
  }
  
  // ==================== UTILS ====================
  
  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
  
  getStatusLabel(status: Status): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj?.label || status;
  }
  
  getStatusClass(status: Status): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return `bg-${statusObj?.class || 'secondary'}`;
  }
  
  getTipoLabel(tipo: TipoOrdemOrcamento): string {
    const tipoObj = this.tiposServico.find(t => t.value === tipo);
    return tipoObj?.label || tipo;
  }
  
  formatarDataHora(dataISO: string): string {
    if (!dataISO) return '-';
    try {
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) return '-';
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const hora = String(data.getHours()).padStart(2, '0');
      const min = String(data.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} ${hora}:${min}`;
    } catch {
      return '-';
    }
  }
  
  getClienteNome(ordem: OrdemServico): string {
    return ordem.nmCliente || '-';
  }
  
  getVeiculoInfo(ordem: OrdemServico): string {
    if (ordem.placaVeiculo && ordem.modeloVeiculo) {
      return `${ordem.placaVeiculo} - ${ordem.modeloVeiculo}`;
    } else if (ordem.placaVeiculo) {
      return ordem.placaVeiculo;
    } else if (ordem.modeloVeiculo) {
      return ordem.modeloVeiculo;
    }
    return '-';
  }
}