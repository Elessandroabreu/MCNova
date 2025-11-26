// src/app/core/models/models-extended.ts

import { FormaPagamento, StatusAgendamento, StatusOrdemServico, TipoServico } from './enums';

// ==================== PRODUTO ====================
export interface Produto {
  cdProduto: number;
  nmProduto: string;
  dsProduto?: string;
  categoria?: string;
  vlCusto: number;
  vlVenda: number;
  qtdEstoque: number;
  qtdMinimo: number;
  ativo: boolean;
  dataCadastro: string;
}

export interface ProdutoRequest {
  nmProduto: string;
  dsProduto?: string | null;
  categoria?: string | null;
  vlCusto: number;
  vlVenda: number;
  qtdEstoque: number;
  qtdMinimo: number;
}

// ==================== SERVICO ====================
export interface Servico {
  cdServico: number;
  nmServico: string;
  dsServico?: string;
  vlServico: number;
  tmpEstimado: number;
  ativo: boolean;
  dataCadastro: string;
}

export interface ServicoRequest {
  nmServico: string;
  dsServico?: string;
  vlServico: number;
  tmpEstimado?: number;
}

// ==================== AGENDAMENTO ====================
export interface Agendamento {
  cdAgendamento: number;
  cdCliente: number;
  cliente?: { cdCliente: number; nmCliente: string };
  nmCliente: string;
  cdVeiculo: number;
  veiculo?: { cdVeiculo: number; placa: string; modelo: string };
  placa: string;
  cdMecanico: number;
  mecanico?: { cdUsuario: number; nmUsuario: string };
  nmMecanico: string;
  horario: string;
  dataAgendamento: string;
  dhAgendamento?: string;
  dsServico: string;
  status: StatusAgendamento;
  observacoes?: string;
}

export interface AgendamentoRequest {
  cdCliente: number;
  cdVeiculo: number;
  cdMecanico: number;
  horario?: string;
  dhAgendamento?: string;
  dataAgendamento?: string;
  dsServico: string;
  observacoes?: string;
  status?: StatusAgendamento;
}

// ==================== ORDEM DE SERVICO ====================
export interface ItemOrdemServico {
  cdItemOrdemServico: number;
  cdProduto?: number;
  nmProduto?: string;
  cdServico?: number;
  nmServico?: string;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
}

export interface OrdemServico {
  cdOrdemServico: number;
  cdCliente: number;
  cliente?: { cdCliente: number; nmCliente: string };
  nmCliente: string;
  cdVeiculo: number;
  veiculo?: { cdVeiculo: number; placa: string; modelo: string };
  placa: string;
  cdMecanico: number;
  nmMecanico: string;
  tipoServico: TipoServico;
  status: StatusOrdemServico;
  statusOrdemServico: StatusOrdemServico;
  dataAbertura: string;
  dataFechamento?: string;
  vlPecas: number;
  vlMaoObra: number;
  vlTotal: number;
  desconto: number;
  observacoes?: string;
  diagnostico?: string;
  aprovado: boolean;
  itens: ItemOrdemServico[];
}

export interface ItemOrdemServicoRequest {
  cdProduto?: number;
  cdServico?: number;
  quantidade: number;
  vlUnitario: number;
}

export interface OrdemServicoRequest {
  cdCliente: number;
  cdVeiculo: number;
  cdMecanico?: number;
  tipoServico: TipoServico;
  vlMaoObra?: number;
  desconto?: number;
  observacoes?: string;
  diagnostico?: string;
  itens?: ItemOrdemServicoRequest[];
}

// ==================== VENDA ====================
export interface ItemVenda {
  cdItemVenda: number;
  cdProduto: number;
  nmProduto: string;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
}

export interface Venda {
  cdVenda: number;
  cdCliente?: number;
  cliente?: { cdCliente: number; nmCliente: string };
  nmCliente: string;
  cdAtendente: number;
  atendente?: { cdUsuario: number; nmUsuario: string };
  nmAtendente: string;
  dataVenda: string;
  vlTotal: number;
  desconto: number;
  formaPagamento: FormaPagamento;
  itens?: ItemVenda[];
  dataCadastro: string;
}

export interface ItemVendaRequest {
  cdProduto: number;
  quantidade: number;
  vlUnitario: number;
}

export interface VendaRequest {
  cdCliente?: number;
  cdAtendente: number;
  desconto?: number;
  formaPagamento: FormaPagamento;
  itens: ItemVendaRequest[];
}

// ==================== FATURAMENTO ====================
export interface Faturamento {
  cdFaturamento: number;
  cdVenda?: number;
  venda?: { cdVenda: number };
  cdOrdemServico?: number;
  ordemServico?: { cdOrdemServico: number };
  cdCliente?: number;
  cliente?: { cdCliente: number; nmCliente: string };
  dataVenda: string;
  dataFaturamento: string;
  vlTotal: number;
  formaPagamento: FormaPagamento;
  nomeCliente: string;
  tipoTransacao: string;
}