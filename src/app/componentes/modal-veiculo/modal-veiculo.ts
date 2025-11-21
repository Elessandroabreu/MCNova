// src/app/componentes/modal-veiculo/modal-veiculo.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Veiculo, VeiculoRequest } from '../../shared/models/veiculo.model';
import { Cliente } from '../../shared/models/cliente.model';
import { ClienteService } from '../../shared/services/cliente.service';

declare var bootstrap: any;

@Component({
  selector: 'app-modal-veiculo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-veiculo.html',
  styleUrl: './modal-veiculo.scss',
})
export class ModalVeiculo implements OnInit {
  @Input() veiculo?: Veiculo;
  @Output() salvar = new EventEmitter<VeiculoRequest>();
  @Output() fechar = new EventEmitter<void>();

  protected form!: FormGroup;
  protected submitted: boolean = false;
  protected clientes: Cliente[] = [];
  private modal: any;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.criarForm();
    this.carregarClientes();
    
    if (this.veiculo) {
      this.preencherForm();
    }
  }

  private criarForm(): void {
    this.form = this.fb.group({
      cdCliente: ['', [Validators.required]],
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{4}$/)]],
      marca: ['', [Validators.required, Validators.maxLength(50)]],
      modelo: ['', [Validators.required, Validators.maxLength(50)]],
      ano: ['', [Validators.required, Validators.min(1900), Validators.max(2099)]],
      cor: ['', [Validators.maxLength(30)]],
    });
  }

  private carregarClientes(): void {
    this.clienteService.listarAtivos().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (erro) => {
        console.error('Erro ao carregar clientes:', erro);
      },
    });
  }

  private preencherForm(): void {
    if (this.veiculo) {
      this.form.patchValue({
        cdCliente: this.veiculo.cdCliente,
        placa: this.veiculo.placa,
        marca: this.veiculo.marca,
        modelo: this.veiculo.modelo,
        ano: this.veiculo.ano,
        cor: this.veiculo.cor,
      });
    }
  }

  abrir(): void {
    const modalElement = document.getElementById('modalVeiculo');
    this.modal = new bootstrap.Modal(modalElement);
    this.modal.show();
  }

  fecharModal(): void {
    this.modal?.hide();
    this.form.reset();
    this.submitted = false;
    this.fechar.emit();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const veiculoData: VeiculoRequest = {
      ...this.form.value,
      placa: this.form.value.placa.toUpperCase(),
    };

    this.salvar.emit(veiculoData);
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
    if (control?.hasError('pattern')) {
      return 'Formato inválido. Use: ABC-1234';
    }
    if (control?.hasError('min')) {
      return 'Ano inválido';
    }
    if (control?.hasError('max')) {
      return 'Ano inválido';
    }
    if (control?.hasError('maxLength')) {
      return 'Tamanho máximo excedido';
    }
    
    return '';
  }
}