// src/app/componentes/modal-agendamento/modal-agendamento.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgendamentoResponse, AgendamentoRequest, StatusAgendamento } from '../../shared/models/agendamento.model';
import { Cliente } from '../../shared/models/cliente.model';
import { Veiculo } from '../../shared/models/veiculo.model';
import { Usuario } from '../../shared/models/usuario.model';
import { ClienteService } from '../../shared/services/cliente.service';
import { VeiculoService } from '../../shared/services/veiculo.service';
import { UsuarioService } from '../../shared/services/usuario.service';

declare var bootstrap: any;

@Component({
  selector: 'app-modal-agendamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-agendamento.html',
  styleUrl: './modal-agendamento.scss',
})
export class ModalAgendamento implements OnInit {
  @Input() agendamento?: AgendamentoResponse;
  @Output() salvar = new EventEmitter<AgendamentoRequest>();
  @Output() fechar = new EventEmitter<void>();

  protected form!: FormGroup;
  protected submitted: boolean = false;
  protected clientes: Cliente[] = [];
  protected veiculos: Veiculo[] = [];
  protected mecanicos: Usuario[] = [];
  private modal: any;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private veiculoService: VeiculoService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.criarForm();
    this.carregarDados();
    
    if (this.agendamento) {
      this.preencherForm();
    }
  }

  private criarForm(): void {
    this.form = this.fb.group({
      cdCliente: ['', [Validators.required]],
      cdVeiculo: ['', [Validators.required]],
      cdMecanico: ['', [Validators.required]],
      horario: ['', [Validators.required]],
      status: ['AGENDADO'],
      observacoes: ['', [Validators.maxLength(500)]],
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

    // Carregar mecânicos
    this.usuarioService.listarMecanicos().subscribe({
      next: (mecanicos) => {
        this.mecanicos = mecanicos;
      },
      error: (erro) => console.error('Erro ao carregar mecânicos:', erro),
    });
  }

  onClienteChange(): void {
    const cdCliente = this.form.get('cdCliente')?.value;
    
    if (cdCliente) {
      this.veiculoService.listarPorCliente(cdCliente).subscribe({
        next: (veiculos) => {
          this.veiculos = veiculos;
          this.form.get('cdVeiculo')?.enable();
        },
        error: (erro) => {
          console.error('Erro ao carregar veículos:', erro);
          this.veiculos = [];
        },
      });
    } else {
      this.veiculos = [];
      this.form.get('cdVeiculo')?.setValue('');
      this.form.get('cdVeiculo')?.disable();
    }
  }

  private preencherForm(): void {
    if (this.agendamento) {
      // Carregar veículos do cliente para edição
      this.veiculoService.listarPorCliente(this.agendamento.cdCliente).subscribe({
        next: (veiculos) => {
          this.veiculos = veiculos;
          this.form.patchValue({
            cdCliente: this.agendamento!.cdCliente,
            cdVeiculo: this.agendamento!.cdVeiculo,
            cdMecanico: this.agendamento!.cdMecanico,
            horario: this.agendamento!.horario,
            status: this.agendamento!.status,
            observacoes: this.agendamento!.observacoes,
          });
        },
      });
    }
  }

  abrir(): void {
    const modalElement = document.getElementById('modalAgendamento');
    this.modal = new bootstrap.Modal(modalElement);
    this.modal.show();
  }

  fecharModal(): void {
    this.modal?.hide();
    this.form.reset({
      status: 'AGENDADO'
    });
    this.submitted = false;
    this.veiculos = [];
    this.fechar.emit();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const agendamentoData: AgendamentoRequest = {
      cdCliente: parseInt(this.form.value.cdCliente),
      cdVeiculo: parseInt(this.form.value.cdVeiculo),
      cdMecanico: parseInt(this.form.value.cdMecanico),
      horario: this.form.value.horario,
      status: this.form.value.status as StatusAgendamento,
      observacoes: this.form.value.observacoes || undefined,
    };

    this.salvar.emit(agendamentoData);
  }

  isInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return (control?.invalid && this.submitted) ?? false;
  }

  getMensagemErro(campo: string): string {
    const control = this.form.get(campo);
    
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (control?.hasError('maxLength')) {
      return 'Tamanho máximo excedido';
    }
    
    return '';
  }
}