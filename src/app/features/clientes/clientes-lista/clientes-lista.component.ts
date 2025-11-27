import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente, ClienteRequest } from '../../../core/models';
import { formatarCPF, formatarTelefone, removerFormatacao, validarCPF } from '../../../core/utils/validators.util';
import { formatarData } from '../../../core/utils/formatters.util';

declare var bootstrap: any;

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './clientes-lista.component.html',
  styleUrl: './clientes-lista.component.scss'
})
export class ClientesListaComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);
  
  @ViewChild('clienteModal') modalElement!: ElementRef;
  private modalInstance: any;
  
  clientes = signal<Cliente[]>([]);
  clientesFiltrados = signal<Cliente[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  
  clienteForm!: FormGroup;
  modoEdicao = signal(false);
  clienteEditando = signal<Cliente | null>(null);
  
  searchTerm = signal('');
  
  ngOnInit(): void {
    this.inicializarForm();
    this.carregarClientes();
  }
  
  ngAfterViewInit(): void {
    // Inicializa o modal do Bootstrap
    if (this.modalElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }
  
  inicializarForm(): void {
    this.clienteForm = this.fb.group({
      nmCliente: ['', [Validators.required, Validators.maxLength(120)]],
      nuCPF: ['', [Validators.required, this.cpfValidator]],
      nuTelefone: ['', [Validators.required]],
      dsEndereco: ['', [Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]]
    });
  }
  
  carregarClientes(): void {
    this.isLoading.set(true);
    
    this.clienteService.listarAtivos().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.aplicarFiltro();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  aplicarFiltro(): void {
    const termo = this.searchTerm().toLowerCase();
    
    if (!termo) {
      this.clientesFiltrados.set(this.clientes());
      return;
    }
    
    const filtrados = this.clientes().filter(cliente =>
      cliente.nmCliente.toLowerCase().includes(termo) ||
      cliente.nuCPF?.includes(termo) ||
      cliente.email?.toLowerCase().includes(termo) ||
      cliente.nuTelefone?.includes(termo)
    );
    
    this.clientesFiltrados.set(filtrados);
  }
  
  abrirModalNovo(): void {
    this.modoEdicao.set(false);
    this.clienteEditando.set(null);
    this.clienteForm.reset();
    this.modalInstance?.show();
  }
  
  abrirModalEditar(cliente: Cliente): void {
    this.modoEdicao.set(true);
    this.clienteEditando.set(cliente);
    
    this.clienteForm.patchValue({
      nmCliente: cliente.nmCliente,
      nuCPF: cliente.nuCPF || '',
      nuTelefone: cliente.nuTelefone || '',
      dsEndereco: cliente.dsEndereco || '',
      email: cliente.email || ''
    });
    
    this.modalInstance?.show();
  }
  
  fecharModal(): void {
    this.modalInstance?.hide();
    this.clienteForm.reset();
  }
  
  salvar(): void {
    if (this.clienteForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }
    
    this.isSubmitting.set(true);
    
    const formValue = this.clienteForm.value;
    const dados: ClienteRequest = {
      nmCliente: formValue.nmCliente,
      nuCPF: formValue.nuCPF ? removerFormatacao(formValue.nuCPF) : undefined,
      nuTelefone: formValue.nuTelefone ? removerFormatacao(formValue.nuTelefone) : undefined,
      dsEndereco: formValue.dsEndereco || undefined,
      email: formValue.email || undefined
    };
    
    const operacao = this.modoEdicao()
      ? this.clienteService.atualizar(this.clienteEditando()!.cdCliente, dados)
      : this.clienteService.criar(dados);
    
    operacao.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.fecharModal();
        this.carregarClientes();
      },
      error: (error) => {
        console.error('Erro ao salvar cliente:', error);
        this.isSubmitting.set(false);
        alert(error.message || 'Erro ao salvar cliente');
      }
    });
  }
  
  confirmarExclusao(cliente: Cliente): void {
    if (confirm(`Deseja realmente excluir o cliente "${cliente.nmCliente}"?`)) {
      this.clienteService.deletar(cliente.cdCliente).subscribe({
        next: () => {
          this.carregarClientes();
        },
        error: (error) => {
          console.error('Erro ao excluir cliente:', error);
          alert('Erro ao excluir cliente');
        }
      });
    }
  }
  
  // Formatação em tempo real
  formatarCPFInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      input.value = formatarCPF(value);
    }
  }
  
  formatarTelefoneInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      input.value = formatarTelefone(value);
    }
  }
  
  // Validadores
  cpfValidator(control: any): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }
    
    const cpfLimpo = removerFormatacao(control.value);
    
    if (cpfLimpo.length !== 11) {
      return { cpfInvalido: true };
    }
    
    if (!validarCPF(cpfLimpo)) {
      return { cpfInvalido: true };
    }
    
    return null;
  }
  
  // Helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.clienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  
  getFieldError(fieldName: string): string {
    const field = this.clienteForm.get(fieldName);
    
    if (field?.hasError('required')) return 'Campo obrigatório';
    if (field?.hasError('email')) return 'Email inválido';
    if (field?.hasError('cpfInvalido')) return 'CPF inválido';
    if (field?.hasError('pattern')) return 'Formato inválido';
    if (field?.hasError('maxlength')) {
      const max = field.errors?.['maxlength'].requiredLength;
      return `Máximo de ${max} caracteres`;
    }
    
    return '';
  }
  
  marcarCamposComoTocados(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      this.clienteForm.get(key)?.markAsTouched();
    });
  }
  
  formatarData(data: string): string {
    return formatarData(data);
  }
}
