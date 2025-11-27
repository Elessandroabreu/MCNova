import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AgendamentoService } from '../../../core/services/agendamento.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { VeiculoService } from '../../../core/services/veiculo.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Agendamento, AgendamentoRequest, Cliente, Veiculo, Usuario, StatusAgendamento } from '../../../core/models';
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
  private agendamentoService = inject(AgendamentoService);
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
  filtroStatus = signal<StatusAgendamento | 'TODOS'>('TODOS');
  
  statusOptions = [
    { value: 'TODOS' as const, label: 'Todos', class: 'secondary' },
    { value: StatusAgendamento.AGENDADO, label: 'Agendado', class: 'primary' },
    { value: StatusAgendamento.EM_ANDAMENTO, label: 'Em Andamento', class: 'warning' },
    { value: StatusAgendamento.CONCLUIDO, label: 'Concluído', class: 'success' },
    { value: StatusAgendamento.CANCELADO, label: 'Cancelado', class: 'danger' }
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
    this.agendamentoForm = this.fb.group({
      cdCliente: ['', [Validators.required]],
      cdVeiculo: ['', [Validators.required]],
      cdMecanico: ['', [Validators.required]],
      dataAgendamento: ['', [Validators.required]], // ✅ APENAS DATA
      observacoes: ['', [Validators.maxLength(1000)]]
    });
    
    // Listener para carregar veículos quando selecionar cliente
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
      this.agendamentoService.listarFuturos().subscribe({
        next: (agendamentos) => {
          this.agendamentos.set(agendamentos);
          this.aplicarFiltro();
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar agendamentos:', error);
          alert('Erro ao carregar agendamentos: ' + (error.error?.message || error.message));
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
    
    // Filtro por status
    if (this.filtroStatus() !== 'TODOS') {
      filtrados = filtrados.filter(a => a.status === this.filtroStatus());
    }
    
    // Filtro por busca
    if (termo) {
      filtrados = filtrados.filter(agendamento =>
        agendamento.nmCliente?.toLowerCase().includes(termo) ||
        agendamento.placa?.toLowerCase().includes(termo) ||
        agendamento.nmMecanico?.toLowerCase().includes(termo) ||
        agendamento.observacoes?.toLowerCase().includes(termo)
      );
    }
    
    this.agendamentosFiltrados.set(filtrados);
  }
  
  alterarFiltroStatus(status: StatusAgendamento | 'TODOS'): void {
    this.filtroStatus.set(status);
    this.aplicarFiltro();
  }
  
  abrirModalNovo(): void {
    this.modoEdicao.set(false);
    this.agendamentoEditando.set(null);
    this.agendamentoForm.reset();
    
    // ✅ Data padrão: hoje
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0]; // "2025-01-20"
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
      dataAgendamento: agendamento.dataAgendamento, // ✅ Já vem no formato correto "2025-01-20"
      observacoes: agendamento.observacoes || ''
    });
    
    // Carregar veículos do cliente
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
      dataAgendamento: formValue.dataAgendamento, // ✅ Já está no formato "2025-01-20"
      observacoes: formValue.observacoes || undefined,
      status: StatusAgendamento.AGENDADO
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
        alert('Erro ao salvar agendamento: ' + (error.error?.message || error.message));
      }
    });
  }
  
  confirmarCancelamento(agendamento: Agendamento): void {
    if (confirm(`Deseja realmente cancelar o agendamento de ${agendamento.nmCliente} no dia ${this.formatarData(agendamento.dataAgendamento)}?`)) {
      this.agendamentoService.cancelar(agendamento.cdAgendamento).subscribe({
        next: () => {
          this.carregarAgendamentos();
          alert('Agendamento cancelado com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao cancelar agendamento:', error);
          alert('Erro ao cancelar agendamento: ' + (error.error?.message || error.message));
        }
      });
    }
  }
  
  getStatusLabel(status: StatusAgendamento): string {
    const statusObj = this.statusOptions.find(s => s.value === status);
    return statusObj?.label || status;
  }
  
  getStatusClass(status: StatusAgendamento): string {
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
  
  // ✅ FUNÇÃO CORRIGIDA: Apenas data
  formatarData(data: string): string {
    return formatarDataSimples(data);
  }
}