// src/app/view/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
import { Card } from '../../componentes/card/card';
import { BotaoGrande } from '../../componentes/botao-grande/botao-grande';
import { Titulo } from '../../componentes/titulo/titulo';
import { OrdemServicoService } from '../../shared/services/ordem-servico.service';
import { FaturamentoService } from '../../shared/services/faturamento.service';
import { StatusOrdemServico } from '../../shared/models/ordem-servico.model';

@Component({
  selector: 'app-dashboard',
  imports: [Card, BotaoGrande, Titulo],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  protected ordensAbertas: number = 0;
  protected ordensFinalizadas: number = 0;
  protected ordensEntregues: number = 0;
  protected faturamentoDia: number = 0;

  constructor(
    private ordemServicoService: OrdemServicoService,
    private faturamentoService: FaturamentoService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.ordemServicoService.listarPorStatus(StatusOrdemServico.AGUARDANDO).subscribe({
      next: (ordens) => {
        this.ordensAbertas = ordens.length;
      },
    });

    this.ordemServicoService.listarPorStatus(StatusOrdemServico.CONCLUIDA).subscribe({
      next: (ordens) => {
        this.ordensFinalizadas = ordens.length;
      },
    });

    // ✅ CORRIGIDO: usar calcularTotalDia e tipar o retorno
    this.faturamentoService.calcularTotalDia().subscribe({
      next: (resultado: { totalDia: number }) => {
        this.faturamentoDia = resultado.totalDia;
      },
    });
  }
}