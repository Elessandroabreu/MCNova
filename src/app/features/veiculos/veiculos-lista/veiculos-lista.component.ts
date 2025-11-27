import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VeiculoService } from '../../../core/services/veiculo.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { Veiculo, VeiculoRequest, Cliente } from '../../../core/models';
import { formatarData } from '../../../core/utils/formatters.util';

declare var bootstrap: any;

@Component({
  selector: 'app-veiculos-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './veiculos-lista.component.html',
  styleUrl: './veiculos-lista.component.scss'
})
export class VeiculosListaComponent implements OnInit {
  private veiculoService = inject(VeiculoService);
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);
  
  @ViewChild('veiculoModal') modalElement!: ElementRef;
  private modalInstance: any;
  
  veiculos = signal<Veiculo[]>([]);
  veiculosFiltrados = signal<Veiculo[]>([]);
  clientes = signal<Cliente[]>([]);
  
  isLoading = signal(false);
  isSubmitting = signal(false);
  
  veiculoForm!: FormGroup;
  modoEdicao = signal(false);
  veiculoEditando = signal<Veiculo | null>(null);
  
  searchTerm = signal('');
  
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
    this.veiculoForm = this.fb.group({
      cdCliente: ['', [Validators.required]],
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/)]],
      modelo: ['', [Validators.required, Validators.maxLength(100)]],
      marca: ['', [Validators.required, Validators.maxLength(50)]],
      ano: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      cor: ['', [Validators.maxLength(30)]]
    });
  }
  
  carregarDados(): void {
    this.isLoading.set(true);
    
    Promise.all([
      this.carregarVeiculos(),
      this.carregarClientes()
    ]).finally(() => {
      this.isLoading.set(false);
    });
  }
  
  carregarVeiculos(): Promise<void> {
    return new Promise((resolve) => {
      this.veiculoService.listarTodos().subscribe({
        next: (veiculos) => {
          this.veiculos.set(veiculos);
          this.aplicarFiltro();
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar veículos:', error);
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
        error: (error) => {
          console.error('Erro ao carregar clientes:', error);
          resolve();
        }
      });
    });
  }
  
  aplicarFiltro(): void {
    const termo = this.searchTerm().toLowerCase();
    
    if (!termo) {
      this.veiculosFiltrados.set(this.veiculos());
      return;
    }
    
    const filtrados = this.veiculos().filter(veiculo =>
      veiculo.placa.toLowerCase().includes(termo) ||
      veiculo.modelo.toLowerCase().includes(termo) ||
      veiculo.marca?.toLowerCase().includes(termo) ||
      veiculo.cliente?.nmCliente.toLowerCase().includes(termo)
    );
    
    this.veiculosFiltrados.set(filtrados);
  }
  
  abrirModalNovo(): void {
    this.modoEdicao.set(false);
    this.veiculoEditando.set(null);
    this.veiculoForm.reset();
    this.modalInstance?.show();
  }
  
  abrirModalEditar(veiculo: Veiculo): void {
    this.modoEdicao.set(true);
    this.veiculoEditando.set(veiculo);
    
    this.veiculoForm.patchValue({
      cdCliente: veiculo.cliente?.cdCliente || '',
      placa: veiculo.placa,
      modelo: veiculo.modelo,
      marca: veiculo.marca || '',
      ano: veiculo.ano || '',
      cor: veiculo.cor || ''
    });
    
    this.modalInstance?.show();
  }
  
  fecharModal(): void {
    this.modalInstance?.hide();
    this.veiculoForm.reset();
  }
  
  salvar(): void {
    if (this.veiculoForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }
    
    this.isSubmitting.set(true);
    
    const formValue = this.veiculoForm.value;
    const dados: VeiculoRequest = {
      cdCliente: formValue.cdCliente,
      placa: formValue.placa.toUpperCase().replace('-', ''),
      modelo: formValue.modelo,
      marca: formValue.marca || undefined,
      ano: formValue.ano || undefined,
      cor: formValue.cor || undefined
    };
    
    const operacao = this.modoEdicao()
      ? this.veiculoService.atualizar(this.veiculoEditando()!.cdVeiculo, dados)
      : this.veiculoService.criar(dados);
    
    operacao.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.fecharModal();
        this.carregarVeiculos();
      },
      error: (error) => {
        console.error('Erro ao salvar veículo:', error);
        this.isSubmitting.set(false);
        alert(error.message || 'Erro ao salvar veículo');
      }
    });
  }
  
  confirmarExclusao(veiculo: Veiculo): void {
    if (confirm(`Deseja realmente excluir o veículo "${veiculo.placa} - ${veiculo.modelo}"?`)) {
      this.veiculoService.deletar(veiculo.cdVeiculo).subscribe({
        next: () => {
          this.carregarVeiculos();
        },
        error: (error) => {
          console.error('Erro ao excluir veículo:', error);
          alert('Erro ao excluir veículo');
        }
      });
    }
  }
  
  formatarPlacaInput(event: any): void {
    const input = event.target;
    let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Formato antigo: ABC-1234
    if (value.length <= 7 && /^[A-Z]{0,3}\d{0,4}$/.test(value)) {
      if (value.length > 3) {
        input.value = value.slice(0, 3) + '-' + value.slice(3);
      } else {
        input.value = value;
      }
    }
    // Formato Mercosul: ABC1D23
    else if (value.length <= 7) {
      input.value = value;
    }
  }
  
  getClienteNome(cdCliente: number): string {
    const cliente = this.clientes().find(c => c.cdCliente === cdCliente);
    return cliente?.nmCliente || '';
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.veiculoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  
  getFieldError(fieldName: string): string {
    const field = this.veiculoForm.get(fieldName);
    
    if (field?.hasError('required')) return 'Campo obrigatório';
    if (field?.hasError('pattern')) return 'Placa inválida (use ABC-1234 ou ABC1D23)';
    if (field?.hasError('min')) return `Ano mínimo: ${field.errors?.['min'].min}`;
    if (field?.hasError('max')) return `Ano máximo: ${field.errors?.['max'].max}`;
    if (field?.hasError('maxlength')) {
      const max = field.errors?.['maxlength'].requiredLength;
      return `Máximo de ${max} caracteres`;
    }
    
    return '';
  }
  
  marcarCamposComoTocados(): void {
    Object.keys(this.veiculoForm.controls).forEach(key => {
      this.veiculoForm.get(key)?.markAsTouched();
    });
  }
  
  formatarData(data: string): string {
    return formatarData(data);
  }
}
