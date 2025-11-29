import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FaturamentoService } from '../../../core/services/faturamento.service';
import { Faturamento } from '../../../core/models';
import { formatarData } from '../../../core/utils/formatters.util';

@Component({
  selector: 'app-faturamento-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './faturamento-dashboard.component.html',
  styleUrl: './faturamento-dashboard.component.scss'
})
export class FaturamentoDashboardComponent implements OnInit {

  private faturamentoService = inject(FaturamentoService);
  private fb = inject(FormBuilder);

  faturamentos = signal<Faturamento[]>([]);
  faturamentosFiltrados = signal<Faturamento[]>([]);

  isLoading = signal(false);

  totalDia = signal<number>(0);
  totalPeriodo = signal<number>(0);

  filtroForm!: FormGroup;

  ngOnInit(): void {
    this.inicializarForm();
    this.carregarDados();
  }

  inicializarForm(): void {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    this.filtroForm = this.fb.group({
      dataInicio: [trintaDiasAtras.toISOString().split('T')[0]],
      dataFim: [hoje.toISOString().split('T')[0]]
    });
  }

  carregarDados(): void {
    this.isLoading.set(true);

    Promise.all([this.carregarFaturamentoDia(), this.aplicarFiltro()])
      .finally(() => this.isLoading.set(false));
  }

  carregarFaturamentoDia(): Promise<void> {
    return new Promise(resolve => {
      this.faturamentoService.calcularTotalDia().subscribe({
        next: (res) => {
          this.totalDia.set(res.totalDia || 0);
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  aplicarFiltro(): Promise<void> {
    const { dataInicio, dataFim } = this.filtroForm.value;

    return new Promise(resolve => {
      this.faturamentoService.listarPorPeriodo(dataInicio, dataFim).subscribe({
        next: faturamentos => {
          this.faturamentos.set(faturamentos);
          this.faturamentosFiltrados.set(faturamentos);
          this.calcularTotalPeriodo();
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  calcularTotalPeriodo(): void {
    const total = this.faturamentosFiltrados().reduce((sum, f) => sum + f.vlTotal, 0);
    this.totalPeriodo.set(total);
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

formatarData(data: string): string {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR');
}
}
