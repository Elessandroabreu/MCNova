// src/app/view/agenda/agenda.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Titulo } from '../../componentes/titulo/titulo';
import { DropdownBotao } from '../../componentes/dropdown-botao/dropdown-botao';
import { OptionDropdown } from '../../shared/models/option-dropdown';
import { Card } from '../../componentes/card/card';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardAgendamento } from '../../componentes/card-agendamento/card-agendamento';
import { ModalAgendamento } from '../../componentes/modal-agendamento/modal-agendamento';
import { Loading } from '../../componentes/loading/loading';
import { AgendamentoService } from '../../shared/services/agendamento.service';
import { UsuarioService } from '../../shared/services/usuario.service';
import { AgendamentoResponse, AgendamentoRequest, AgendamentoMecanico, AgendamentoItem } from '../../shared/models/agendamento.model';
import { Usuario } from '../../shared/models/usuario.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    Titulo,
    DropdownBotao,
    Card,
    DatePipe,
    FormsModule,
    CardAgendamento,
    ModalAgendamento,
    Loading,
    CommonModule
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda implements OnInit {
  @ViewChild(ModalAgendamento) modalAgendamento!: ModalAgendamento;

  protected loading: boolean = false;
  protected agendamentos: AgendamentoResponse[] = [];
  protected mecanicos: Usuario[] = [];
  protected listaMecanicos: AgendamentoMecanico[] = [];
  protected listaMecanico: OptionDropdown[] = [];
  protected mecanicoSelecionado: string = 'Todos os Mecânicos';
  protected agendamentoSelecionado?: AgendamentoResponse;

  protected date: Date = new Date();

  // Contadores
  protected totalAgendamentos: number = 0;
  protected agendamentosAbertos: number = 0;
  protected agendamentosEmAndamento: number = 0;
  protected agendamentosFinalizados: number = 0;

  constructor(
    private agendamentoService: AgendamentoService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarMecanicos();
    this.carregarAgendamentos();
  }

  carregarMecanicos(): void {
    this.usuarioService.listarMecanicos().subscribe({
      next: (mecanicos) => {
        this.mecanicos = mecanicos;
        this.listaMecanico = [
          new OptionDropdown('Todos os Mecânicos'),
          ...mecanicos.map((m) => new OptionDropdown(m.nmUsuario)),
        ];
      },
      error: (erro) => {
        console.error('Erro ao carregar mecânicos:', erro);
      },
    });
  }

  carregarAgendamentos(): void {
    this.loading = true;
    this.agendamentoService.listarFuturos().subscribe({
      next: (agendamentos) => {
        this.agendamentos = agendamentos;
        this.organizarAgendamentosPorMecanico();
        this.calcularContadores();
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar agendamentos:', erro);
        alert('Erro ao carregar agendamentos. Tente novamente.');
        this.loading = false;
      },
    });
  }

  organizarAgendamentosPorMecanico(): void {
    const agendamentosPorMecanico = new Map<number, AgendamentoResponse[]>();

    this.agendamentos.forEach((agendamento) => {
      if (!agendamentosPorMecanico.has(agendamento.cdMecanico)) {
        agendamentosPorMecanico.set(agendamento.cdMecanico, []);
      }
      agendamentosPorMecanico.get(agendamento.cdMecanico)!.push(agendamento);
    });

    this.listaMecanicos = Array.from(agendamentosPorMecanico.entries()).map(
      ([cdMecanico, agendamentos]) => {
        const mecanico = this.mecanicos.find((m) => m.cdUsuario === cdMecanico);
        
        return {
          nome: mecanico?.nmUsuario || 'Mecânico Desconhecido',
          especialidade: 'Especialista',
          agendamentos: agendamentos.map((a) => this.converterParaItem(a)),
        };
      }
    );
  }

  converterParaItem(agendamento: AgendamentoResponse): AgendamentoItem {
    const horario = new Date(agendamento.horario);
    return {
      hora: horario.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      os: `AG-${agendamento.cdAgendamento}`,
      cliente: `${agendamento.nmCliente} - ${agendamento.placa}`,
      dataCadastro: new Date(agendamento.dataAgendamento).toLocaleDateString('pt-BR'),
      mecanico: agendamento.nmMecanico,
    };
  }

  calcularContadores(): void {
    this.totalAgendamentos = this.agendamentos.length;
    this.agendamentosAbertos = this.agendamentos.filter((a) => a.status === 'AGENDADO').length;
    this.agendamentosEmAndamento = this.agendamentos.filter((a) => a.status === 'EM_ANDAMENTO').length;
    this.agendamentosFinalizados = this.agendamentos.filter((a) => a.status === 'CONCLUIDO').length;
  }

  selecionarMecanico(mecanico: string): void {
    this.mecanicoSelecionado = mecanico;
    
    if (mecanico === 'Todos os Mecânicos') {
      this.organizarAgendamentosPorMecanico();
    } else {
      this.listaMecanicos = this.listaMecanicos.filter((m) => m.nome === mecanico);
    }
  }

  get dateString(): string {
    return this.date.toISOString().split('T')[0];
  }

  onDateChange(value: string): void {
    this.date = new Date(value + 'T00:00:00');
    this.carregarAgendamentos();
  }

  abrirModalNovo(): void {
    this.agendamentoSelecionado = undefined;
    setTimeout(() => this.modalAgendamento.abrir(), 100);
  }

  abrirModalEditar(agendamento: AgendamentoResponse): void {
    this.agendamentoSelecionado = agendamento;
    setTimeout(() => this.modalAgendamento.abrir(), 100);
  }

  salvarAgendamento(agendamentoData: AgendamentoRequest): void {
    this.loading = true;

    if (this.agendamentoSelecionado) {
      this.agendamentoService
        .atualizar(this.agendamentoSelecionado.cdAgendamento, agendamentoData)
        .subscribe({
          next: () => {
            alert('Agendamento atualizado com sucesso!');
            this.modalAgendamento.fecharModal();
            this.carregarAgendamentos();
          },
          error: (erro) => {
            console.error('Erro ao atualizar agendamento:', erro);
            alert('Erro ao atualizar agendamento. Tente novamente.');
            this.loading = false;
          },
        });
    } else {
      this.agendamentoService.criar(agendamentoData).subscribe({
        next: () => {
          alert('Agendamento criado com sucesso!');
          this.modalAgendamento.fecharModal();
          this.carregarAgendamentos();
        },
        error: (erro) => {
          console.error('Erro ao criar agendamento:', erro);
          alert('Erro ao criar agendamento. Tente novamente.');
          this.loading = false;
        },
      });
    }
  }

  cancelarAgendamento(agendamento: AgendamentoResponse): void {
    if (!confirm('Deseja realmente cancelar este agendamento?')) {
      return;
    }

    this.loading = true;
    this.agendamentoService.cancelar(agendamento.cdAgendamento).subscribe({
      next: () => {
        alert('Agendamento cancelado com sucesso!');
        this.carregarAgendamentos();
      },
      error: (erro) => {
        console.error('Erro ao cancelar agendamento:', erro);
        alert('Erro ao cancelar agendamento. Tente novamente.');
        this.loading = false;
      },
    });
  }
}