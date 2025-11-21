// src/app/componentes/modal-servico/modal-servico.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Servico, ServicoRequest } from '../../shared/models/servico.model';

declare var bootstrap: any;

@Component({
  selector: 'app-modal-servico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-servico.html',
  styleUrl: './modal-servico.scss',
})
export class ModalServico implements OnInit {
  @Input() servico?: Servico;
  @Output() salvar = new EventEmitter<ServicoRequest>();
  @Output() fechar = new EventEmitter<void>();

  protected form!: FormGroup;
  protected submitted: boolean = false;
  private modal: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.criarForm();
    
    if (this.servico) {
      this.preencherForm();
    }
  }

  private criarForm(): void {
    this.form = this.fb.group({
      nmServico: ['', [Validators.required, Validators.maxLength(150)]],
      dsServico: ['', [Validators.maxLength(500)]],
      vlServico: [0, [Validators.required, Validators.min(0)]],
      tmpEstimado: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private preencherForm(): void {
    if (this.servico) {
      this.form.patchValue({
        nmServico: this.servico.nmServico,
        dsServico: this.servico.dsServico,
        vlServico: this.servico.vlServico,
        tmpEstimado: this.servico.tmpEstimado,
      });
    }
  }

  abrir(): void {
    const modalElement = document.getElementById('modalServico');
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

    const servicoData: ServicoRequest = this.form.value;
    this.salvar.emit(servicoData);
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
    if (control?.hasError('min')) {
      return 'Valor deve ser maior ou igual a zero';
    }
    if (control?.hasError('maxLength')) {
      return 'Tamanho máximo excedido';
    }
    
    return '';
  }
}