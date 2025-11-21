// src/app/shared/models/agendamento.model.ts
export enum StatusAgendamento {
  AGENDADO = 'AGENDADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export interface AgendamentoResponse {
  cdAgendamento: number;
  cdCliente: number;
  nmCliente: string;
  cdVeiculo: number;
  placa: string;
  cdMecanico: number;
  nmMecanico: string;
  horario: string;
  status: StatusAgendamento;
  observacoes?: string;
  dataAgendamento: string;
}

export interface AgendamentoRequest {
  cdCliente: number;
  cdVeiculo: number;
  cdMecanico: number;
  horario: string;
  observacoes?: string;
  status?: StatusAgendamento;
}

// ✅ Interface para exibição de agendamentos por mecânico
export interface AgendamentoMecanico {
  nome: string;
  especialidade: string;
  agendamentos: AgendamentoItem[];
}

// ✅ Interface para itens individuais de agendamento
export interface AgendamentoItem {
  hora: string;
  os: string;
  cliente: string;
  dataCadastro: string;
  mecanico: string;
}