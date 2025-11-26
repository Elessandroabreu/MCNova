import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ServicoService } from '../../../core/services/servico.service';
import { Servico, ServicoRequest } from '../../../core/models';
import { formatarData } from '../../../core/utils/formatters.util';

declare var bootstrap: any;

@Component({
  selector: 'app-servicos-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './servicos-lista.component.html',
  styleUrl: './servicos-lista.component.scss'
})
export class ServicosListaComponent implements OnInit {
  private servicoService = inject(ServicoService);
  private fb = inject(FormBuilder);
  
  @ViewChild('servicoModal') modalElement!: ElementRef;
  private modalInstance: any;
  
  servicos = signal<Servico[]>([]);
  servicosFiltrados = signal<Servico[]>([]);
  
  isLoading = signal(false);
  isSubmitting = signal(false);
  
  servicoForm!: FormGroup;
  modoEdicao = signal(false);
  servicoEditando = signal<Servico | null>(null);
  
  searchTerm = signal('');
  
  ngOnInit(): void {
    this.inicializarForm();
    this.carregarServicos();
  }
  
  ngAfterViewInit(): void {
    if (this.modalElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }
  
  inicializarForm(): void {
    this.servicoForm = this.fb.group({
      nmServico: ['', [Validators.required, Validators.maxLength(120)]],
      dsServico: ['', [Validators.maxLength(255)]],
      vlServico: ['', [Validators.required, Validators.min(0)]]
    });
  }
  
  carregarServicos(): void {
    this.isLoading.set(true);
    
    this.servicoService.listarAtivos().subscribe({
      next: (servicos) => {
        this.servicos.set(servicos);
        this.aplicarFiltro();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar serviços:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  aplicarFiltro(): void {
    const termo = this.searchTerm().toLowerCase();
    
    if (!termo) {
      this.servicosFiltrados.set(this.servicos());
      return;
    }
    
    const filtrados = this.servicos().filter(servico =>
      servico.nmServico.toLowerCase().includes(termo) ||
      servico.dsServico?.toLowerCase().includes(termo)
    );
    
    this.servicosFiltrados.set(filtrados);
  }
  
  abrirModalNovo(): void {
    this.modoEdicao.set(false);
    this.servicoEditando.set(null);
    this.servicoForm.reset();
    this.modalInstance?.show();
  }
  
  abrirModalEditar(servico: Servico): void {
    this.modoEdicao.set(true);
    this.servicoEditando.set(servico);
    
    this.servicoForm.patchValue({
      nmServico: servico.nmServico,
      dsServico: servico.dsServico || '',
      vlServico: servico.vlServico
    });
    
    this.modalInstance?.show();
  }
  
  fecharModal(): void {
    this.modalInstance?.hide();
    this.servicoForm.reset();
  }
  
  salvar(): void {
    if (this.servicoForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }
    
    this.isSubmitting.set(true);
    
    const formValue = this.servicoForm.value;
    const dados: ServicoRequest = {
      nmServico: formValue.nmServico,
      dsServico: formValue.dsServico || undefined,
      vlServico: parseFloat(formValue.vlServico)
    };
    
    const operacao = this.modoEdicao()
      ? this.servicoService.atualizar(this.servicoEditando()!.cdServico, dados)
      : this.servicoService.criar(dados);
    
    operacao.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.fecharModal();
        this.carregarServicos();
      },
      error: (error) => {
        console.error('Erro ao salvar serviço:', error);
        this.isSubmitting.set(false);
        alert(error.message || 'Erro ao salvar serviço');
      }
    });
  }
  
  confirmarExclusao(servico: Servico): void {
    if (confirm(`Deseja realmente excluir o serviço "${servico.nmServico}"?`)) {
      this.servicoService.deletar(servico.cdServico).subscribe({
        next: () => {
          this.carregarServicos();
        },
        error: (error) => {
          console.error('Erro ao excluir serviço:', error);
          alert('Erro ao excluir serviço');
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
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.servicoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  
  getFieldError(fieldName: string): string {
    const field = this.servicoForm.get(fieldName);
    
    if (field?.hasError('required')) return 'Campo obrigatório';
    if (field?.hasError('min')) return `Valor mínimo: ${field.errors?.['min'].min}`;
    if (field?.hasError('maxlength')) {
      const max = field.errors?.['maxlength'].requiredLength;
      return `Máximo de ${max} caracteres`;
    }
    
    return '';
  }
  
  marcarCamposComoTocados(): void {
    Object.keys(this.servicoForm.controls).forEach(key => {
      this.servicoForm.get(key)?.markAsTouched();
    });
  }
  
  formatarData(data: string): string {
    return formatarData(data);
  }
}
