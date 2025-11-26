import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FaturamentoService } from '../../core/services/faturamento.service';
import { VendaService } from '../../core/services/venda.service';
import { ClienteService } from '../../core/services/cliente.service';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { ProdutoService } from '../../core/services/produto.service';
import { AuthService } from '../../core/services/auth.service';
import { StatusOrdemServico } from '../../core/models';
import { Produto } from '../../core/models';

interface DashboardStats {
  faturamentoDia: number;
  vendasDia: number;
  ordensAbertas: number;
  clientesAtivos: number;
  produtosEstoqueBaixo: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private faturamentoService = inject(FaturamentoService);
  private vendaService = inject(VendaService);
  private clienteService = inject(ClienteService);
  private ordemServicoService = inject(OrdemServicoService);
  private produtoService = inject(ProdutoService);
  private authService = inject(AuthService);
  
  stats = signal<DashboardStats>({
    faturamentoDia: 0,
    vendasDia: 0,
    ordensAbertas: 0,
    clientesAtivos: 0,
    produtosEstoqueBaixo: 0
  });
  
  isLoading = signal(true);
  currentUser = this.authService.getCurrentUser();
  
  ngOnInit(): void {
    this.carregarDashboard();
  }
  
  carregarDashboard(): void {
    this.isLoading.set(true);
    
    // Carrega todos os dados em paralelo
    Promise.all([
      this.carregarFaturamentoDia(),
      this.carregarClientesAtivos(),
      this.carregarOrdensAbertas(),
      this.carregarProdutosEstoqueBaixo()
    ]).finally(() => {
      this.isLoading.set(false);
    });
  }
  
  private carregarFaturamentoDia(): Promise<void> {
    return new Promise((resolve) => {
      this.faturamentoService.calcularTotalDia().subscribe({
        next: (response) => {
          this.stats.update(s => ({ ...s, faturamentoDia: response.totalDia || 0 }));
          resolve();
        },
        error: () => {
          resolve();
        }
      });
    });
  }
  
  private carregarClientesAtivos(): Promise<void> {
    return new Promise((resolve) => {
      this.clienteService.listarAtivos().subscribe({
        next: (clientes) => {
          this.stats.update(s => ({ ...s, clientesAtivos: clientes.length }));
          resolve();
        },
        error: () => {
          resolve();
        }
      });
    });
  }
  
  private carregarOrdensAbertas(): Promise<void> {
    return new Promise((resolve) => {
      // Busca ordens em andamento
      this.ordemServicoService.listarPorStatus(StatusOrdemServico.EM_ANDAMENTO).subscribe({
        next: (ordens) => {
          this.stats.update(s => ({ ...s, ordensAbertas: ordens.length }));
          resolve();
        },
        error: () => {
          resolve();
        }
      });
    });
  }
  
  carregarProdutosEstoqueBaixo(): void {
  this.produtoService.buscarEstoqueBaixo().subscribe({
    next: (produtos: Produto[]) => { // ✅ Tipagem correta
      this.produtosEstoqueBaixo = produtos;
    },
    error: (err) => {
      console.error('Erro ao carregar produtos com estoque baixo:', err);
    }
  });
}
  
  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
  
  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
  
  isAtendente(): boolean {
    return this.authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_ATENDENTE']);
  }
  
  isMecanico(): boolean {
    return this.authService.hasRole('ROLE_MECANICO');
  }
}
