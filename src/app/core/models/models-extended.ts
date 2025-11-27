// ========================================
// src/app/core/models/models-extended.ts
// VERSÃO CORRIGIDA - Compatível com o Backend
// ========================================

import { FormaPagamento, StatusOrdemServico, TipoServico, StatusAgendamento } from './enums';

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
  nmCliente?: string; 
  cdVeiculo: number;
  placa?: string; 
  cdMecanico: number;
  nmMecanico?: string; 
  dataAgendamento: string; 
  status: StatusAgendamento;
  observacoes?: string;
}

export interface AgendamentoRequest {
  cdCliente: number;
  cdVeiculo: number;
  cdMecanico: number;
  dataAgendamento: string; // ✅ Formato: "2025-01-20"
  observacoes?: string;
  status?: StatusAgendamento;
}

// ==================== ORDEM DE SERVICO ====================
export interface OrdemServico {
  cdOrdemServico: number;
  cliente?: { cdCliente: number; nmCliente: string };
  veiculo?: { cdVeiculo: number; placa: string; modelo: string };
  mecanico?: { cdUsuario: number; nmUsuario: string };
  tipoServico: TipoServico;
  status: StatusOrdemServico; // Mapeia para statusOrdemServico do backend
  dataAbertura: string;
  dataFechamento?: string;
  vlPecas: number;
  vlMaoObra: number;
  vlTotal: number;
  desconto: number;
  observacoes?: string;
  diagnostico?: string;
  aprovado: boolean;
  itens?: ItemOrdemServico[];
}

export interface OrdemServicoRequest {
  cdCliente: number;
  cdVeiculo: number;
  cdMecanico?: number;
  tipoServico: TipoServico;
  observacoes?: string;
  diagnostico?: string;
  itens: ItemOrdemServicoRequest[];
}

// ==================== ITEM ORDEM DE SERVICO ====================
export interface ItemOrdemServico {
  cdItemOrdemServico: number;
  cdProduto?: number;
  produto?: Produto;
  cdServico?: number;
  servico?: Servico;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
}

export interface ItemOrdemServicoRequest {
  cdProduto?: number;
  cdServico?: number;
  quantidade: number;
  vlUnitario: number;
}

// ==================== VENDA ====================
export interface Venda {
  cdVenda: number;
  cdCliente?: number;
  cliente?: { cdCliente: number; nmCliente: string };
  cdAtendente: number;
  atendente?: { cdUsuario: number; nmUsuario: string };
  dataVenda: string;
  vlTotal: number;
  desconto: number;
  formaPagamento: FormaPagamento;
  itens?: ItemVenda[];
}

export interface VendaRequest {
  cdCliente?: number;
  cdAtendente: number;
  desconto?: number;
  formaPagamento: FormaPagamento;
  itens: ItemVendaRequest[];
}

// ==================== ITEM VENDA ====================
export interface ItemVenda {
  cdItemVenda: number;
  cdProduto: number;
  produto?: Produto;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
}

export interface ItemVendaRequest {
  cdProduto: number;
  quantidade: number;
  vlUnitario: number;
}

// ==================== FATURAMENTO ====================
export interface Faturamento {
  cdFaturamento: number;
  cdVenda?: number;
  venda?: { cdVenda: number };
  cdOrdemServico?: number;
  ordemServico?: { cdOrdemServico: number };
  cliente?: { cdCliente: number; nmCliente: string };
  dataVenda: string;
  dataFaturamento: string;
  vlTotal: number;
  formaPagamento: FormaPagamento;
}