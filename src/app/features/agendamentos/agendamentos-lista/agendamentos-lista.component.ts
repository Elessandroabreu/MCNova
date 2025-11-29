import { Component, inject, OnInit, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AgendamentoService } from '../../../core/services/agendamento.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { VeiculoService } from '../../../core/services/veiculo.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Agendamento, AgendamentoRequest, Cliente, Veiculo, Usuario, Status } from '../../../core/models';
import { formatarDataSimples } from '../../../core/utils/formatters.util';

declare var bootstrap: any;

@Component({
  selector: 'app-agendamentos-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './agendamentos-lista.component.html',
  styleUrl: './agendamentos-lista.component.scss'
})
export class AgendamentosListaComponent implements OnInit {
  public agendamentoService = inject(AgendamentoService);
  private clienteService = inject(ClienteService);
  private veiculoService = inject(VeiculoService);
  private usuarioService = inject(UsuarioService);
  private fb = inject(FormBuilder);
  
  @ViewChild('agendamentoModal') modalElement!: ElementRef;
  private modalInstance: any;
  
  agendamentos = signal<Agendamento[]>([]);
  agendamentosFiltrados = signal<Agendamento[]>([]);
  clientes = signal<Cliente[]>([]);
  veiculos = signal<Veiculo[]>([]);
  veiculosCliente = signal<Veiculo[]>([]);
  mecanicos = signal<Usuario[]>([]);
  
  isLoading = signal(false);
  isSubmitting = signal(false);
  
  agendamentoForm!: FormGroup;
  modoEdicao = signal(false);
  agendamentoEditando = signal<Agendamento | null>(null);
  
  searchTerm = '';
  filtroStatus = signal<Status | 'TODOS'>('TODOS');
  dropdownAbertoId = signal<number | null>(null);
  
  statusOptions = [
    { value: 'TODOS' as const, label: 'Todos', class: 'secondary' },
    { value: Status.AGENDADO, label: 'Agendado', class: 'primary' },
    { value: Status.EM_ANDAMENTO, label: 'Em Andamento', class: 'warning' },
    { value: Status.CONCLUIDO, label: 'Concluído', class: 'success' },
    { value: Status.CANCELADO, label: 'Cancelado', class: 'danger' }
  ];
  
  statusDropdownOptions = [
    { value: Status.AGENDADO, label: 'Agendado', class: 'primary', icon: 'calendar-check' },
    { value: Status.EM_ANDAMENTO, label: 'Em Andamento', class: 'warning', icon: 'play-circle' },
    { value: Status.CONCLUIDO, label: 'Concluído', class: 'success', icon: 'check-circle' },
    { value: Status.CANCELADO, label: 'Cancelado', class: 'danger', icon: 'x-circle' }
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
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.status-dropdown-container')) {
      this.dropdownAbertoId.set(null);
    }
  }
  
  inicializarForm(): void {
    this.agendamentoForm = this.fb.group({
      cdCliente: ['', [Validators.required]],
      cdVeiculo: ['', [Validators.required]],
      cdMecanico: ['', [Validators.required]],
      dataAgendamento: ['', [Validators.required]],
      observacoes: ['', [Validators.maxLength(1000)]]
    });
    
    this.agendamentoForm.get('cdCliente')?.valueChanges.subscribe(cdCliente => {
      if (cdCliente) {
        this.carregarVeiculosCliente(cdCliente);
      } else {
        this.veiculosCliente.set([]);
        this.agendamentoForm.patchValue({ cdVeiculo: '' });
      }
    });
  }
  
  carregarDados(): void {
    this.isLoading.set(true);
    
    Promise.all([
      this.carregarAgendamentos(),
      this.carregarClientes(),
      this.carregarVeiculos(),
      this.carregarMecanicos()
    ]).finally(() => {
      this.isLoading.set(false);
    });
  }
  
  carregarAgendamentos(): Promise<void> {
    return new Promise((resolve) => {
      this.agendamentoService.listarTodos().subscribe({
        next: (agendamentos) => {
          const agendamentosOrdenados = agendamentos.sort((a, b) => {
            return new Date(b.dataAgendamento).getTime() - new Date(a.dataAgendamento).getTime();
          });
          this.agendamentos.set(agendamentosOrdenados);
          this.aplicarFiltro();
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar agendamentos:', error);
          alert('Erro ao carregar agendamentos: ' + (error.message || 'Erro desconhecido'));
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
  
  carregarVeiculos(): Promise<void> {
    return new Promise((resolve) => {
      this.veiculoService.listarTodos().subscribe({
        next: (veiculos) => {
          this.veiculos.set(veiculos);
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
      error: (error) => {
        console.error('Erro ao carregar veículos do cliente:', error);
        this.veiculosCliente.set([]);
      }
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
    const termo = this.searchTerm.toLowerCase();
    let filtrados = this.agendamentos();
    
    if (this.filtroStatus() !== 'TODOS') {
      filtrados = filtrados.filter(a => a.status === this.filtroStatus());
    }
    
    if (termo) {
      filtrados = filtrados.filter(agendamento =>
        agendamento.nomeCliente?.toLowerCase().includes(termo) ||        // ✅ CORRIGIDO
        agendamento.placaVeiculo?.toLowerCase().includes(termo) ||       // ✅ CORRIGIDO
        agendamento.nomeMecanico?.toLowerCase().includes(termo) ||       // ✅ CORRIGIDO
        agendamento.observacoes?.toLowerCase().includes(termo)
      );
    }
    
    this.agendamentosFiltrados.set(filtrados);
  }
  
  alterarFiltroStatus(status: Status | 'TODOS'): void {
    this.filtroStatus.set(status);
    this.aplicarFiltro();
  }
  
  toggleDropdownStatus(agendamentoId: number, event: Event): void {
    event.stopPropagation();
    
    if (this.dropdownAbertoId() === agendamentoId) {
      this.dropdownAbertoId.set(null);
    } else {
      this.dropdownAbertoId.set(agendamentoId);
      
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
  
  isDropdownAberto(agendamentoId: number): boolean {
    return this.dropdownAbertoId() === agendamentoId;
  }
  
  mudarStatus(agendamento: Agendamento, novoStatus: Status, event: Event): void {
    event.stopPropagation();
    this.dropdownAbertoId.set(null);
    
    if (agendamento.status === novoStatus) {
      return;
    }
    
    const mensagens: Record<Status, string> = {
      [Status.AGENDADO]: 'Deseja voltar este agendamento para AGENDADO?',
      [Status.EM_ANDAMENTO]: 'Deseja iniciar este agendamento? A Ordem de Serviço será atualizada automaticamente.',
      [Status.CONCLUIDO]: 'Deseja concluir este agendamento? A Ordem de Serviço será atualizada automaticamente.',
      [Status.CANCELADO]: 'Deseja cancelar este agendamento? A Ordem de Serviço será atualizada automaticamente.'
    };
    
    if (!confirm(mensagens[novoStatus])) {
      return;
    }
    
    this.isLoading.set(true);
    
    this.agendamentoService.atualizarStatus(agendamento.cdAgendamento, novoStatus).subscribe({
      next: () => {
        this.carregarAgendamentos();
        alert('✅ Status atualizado com sucesso! A Ordem de Serviço foi sincronizada automaticamente.');
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        this.isLoading.set(false);
        alert('❌ ' + (error.message || 'Erro ao atualizar status do agendamento'));
      }
    });
  }
  
  abrirModalNovo(): void {
    this.modoEdicao.set(false);
    this.agendamentoEditando.set(null);
    this.agendamentoForm.reset();
    
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    this.agendamentoForm.patchValue({
      dataAgendamento: dataFormatada
    });
    
    this.modalInstance?.show();
  }
  
  abrirModalEditar(agendamento: Agendamento): void {
    this.modoEdicao.set(true);
    this.agendamentoEditando.set(agendamento);
    
    this.agendamentoForm.patchValue({
      cdCliente: agendamento.cdCliente,
      cdVeiculo: agendamento.cdVeiculo,
      cdMecanico: agendamento.cdMecanico,
      dataAgendamento: agendamento.dataAgendamento,
      observacoes: agendamento.observacoes || ''
    });
    
    if (agendamento.cdCliente) {
      this.carregarVeiculosCliente(agendamento.cdCliente);
    }
    
    this.modalInstance?.show();
  }
  
  fecharModal(): void {
    this.modalInstance?.hide();
    this.agendamentoForm.reset();
    this.veiculosCliente.set([]);
  }
  
  salvar(): void {
    if (this.agendamentoForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }
    
    this.isSubmitting.set(true);
    
    const formValue = this.agendamentoForm.value;
    
    const dados: AgendamentoRequest = {
      cdCliente: formValue.cdCliente,
      cdVeiculo: formValue.cdVeiculo,
      cdMecanico: formValue.cdMecanico,
      dataAgendamento: formValue.dataAgendamento,
      observacoes: formValue.observacoes || undefined
    };
    
    const operacao = this.modoEdicao()
      ? this.agendamentoService.atualizar(this.agendamentoEditando()!.cdAgendamento, dados)
      : this.agendamentoService.criar(dados);
    
    operacao.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.fecharModal();
        this.carregarAgendamentos();
        alert(this.modoEdicao() ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao salvar agendamento:', error);
        this.isSubmitting.set(false);
        alert('Erro ao salvar agendamento: ' + (error.message || 'Erro desconhecido'));
      }
    });
  }
  
  confirmarCancelamento(agendamento: Agendamento): void {
    if (confirm(`Deseja realmente cancelar o agendamento de ${agendamento.nomeCliente} no dia ${this.formatarData(agendamento.dataAgendamento)}?`)) {
      this.agendamentoService.cancelar(agendamento.cdAgendamento).subscribe({
        next: () => {
          this.carregarAgendamentos();
          alert('Agendamento cancelado com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao cancelar agendamento:', error);
          alert('Erro ao cancelar agendamento: ' + (error.message || 'Erro desconhecido'));
        }
      });
    }
  }
  
  getStatusLabel(status: Status): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj?.label || status;
  }
  
  getStatusClass(status: Status): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return `bg-${statusObj?.class || 'secondary'}`;
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.agendamentoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  
  getFieldError(fieldName: string): string {
    const field = this.agendamentoForm.get(fieldName);
    
    if (field?.hasError('required')) return 'Campo obrigatório';
    if (field?.hasError('maxlength')) {
      const max = field.errors?.['maxlength'].requiredLength;
      return `Máximo de ${max} caracteres`;
    }
    
    return '';
  }
  
  marcarCamposComoTocados(): void {
    Object.keys(this.agendamentoForm.controls).forEach(key => {
      this.agendamentoForm.get(key)?.markAsTouched();
    });
  }
  
  formatarData(data: string): string {
    return formatarDataSimples(data);
  }
}