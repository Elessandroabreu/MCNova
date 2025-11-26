import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AgendamentoService } from '../../../core/services/agendamento.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { VeiculoService } from '../../../core/services/veiculo.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Agendamento, AgendamentoRequest, Cliente, Veiculo, Usuario, StatusAgendamento } from '../../../core/models';
import { formatarData, formatarDataHora, dataParaISO, dataHoraParaISO } from '../../../core/utils/formatters.util';

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
  
  searchTerm = signal('');
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
      dataAgendamento: ['', [Validators.required]],
      horaAgendamento: ['', [Validators.required]],
      dsServico: ['', [Validators.required, Validators.maxLength(255)]],
      observacoes: ['', [Validators.maxLength(500)]]
    });
    
    // Listener para carregar veículos quando selecionar cliente
    this.agendamentoForm.get('cdCliente')?.valueChanges.subscribe(cdCliente => {
      if (cdCliente) {
        this.carregarVeiculosCliente(cdCliente);
      } else {
        this.veiculosCliente.set([]);
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
    const termo = this.searchTerm().toLowerCase();
    let filtrados = this.agendamentos();
    
    // Filtro por status
    if (this.filtroStatus() !== 'TODOS') {
      filtrados = filtrados.filter(a => a.status === this.filtroStatus());
    }
    
    // Filtro por busca
    if (termo) {
      filtrados = filtrados.filter(agendamento =>
        agendamento.cliente?.nmCliente.toLowerCase().includes(termo) ||
        agendamento.veiculo?.placa.toLowerCase().includes(termo) ||
        agendamento.mecanico?.nmUsuario.toLowerCase().includes(termo) ||
        agendamento.dsServico.toLowerCase().includes(termo)
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
    
    // Data padrão: hoje
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
    
    // Extrair data e hora
    const dataHora = new Date(agendamento.dataAgendamento);
    const data = dataHora.toISOString().split('T')[0];
    const hora = dataHora.toTimeString().slice(0, 5);
    
    this.agendamentoForm.patchValue({
      cdCliente: agendamento.cliente?.cdCliente || '',
      cdVeiculo: agendamento.veiculo?.cdVeiculo || '',
      cdMecanico: agendamento.mecanico?.cdUsuario || '',
      dataAgendamento: data,
      horaAgendamento: hora,
      dsServico: agendamento.dsServico,
      observacoes: agendamento.observacoes || ''
    });
    
    // Carregar veículos do cliente
    if (agendamento.cliente?.cdCliente) {
      this.carregarVeiculosCliente(agendamento.cliente.cdCliente);
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
    
    // Combinar data e hora
    const dataHoraISO = dataHoraParaISO(formValue.dataAgendamento, formValue.horaAgendamento);
    
    const dados: AgendamentoRequest = {
      cdCliente: formValue.cdCliente,
      cdVeiculo: formValue.cdVeiculo,
      cdMecanico: formValue.cdMecanico,
      dataAgendamento: dataHoraISO,
      dsServico: formValue.dsServico,
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
      },
      error: (error) => {
        console.error('Erro ao salvar agendamento:', error);
        this.isSubmitting.set(false);
        alert(error.message || 'Erro ao salvar agendamento');
      }
    });
  }
  
  confirmarCancelamento(agendamento: Agendamento): void {
    if (confirm(`Deseja realmente cancelar o agendamento para ${agendamento.cliente?.nmCliente}?`)) {
      this.agendamentoService.cancelar(agendamento.cdAgendamento).subscribe({
        next: () => {
          this.carregarAgendamentos();
        },
        error: (error) => {
          console.error('Erro ao cancelar agendamento:', error);
          alert('Erro ao cancelar agendamento');
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
  
  formatarDataHora(data: string): string {
    return formatarDataHora(data);
  }
}
