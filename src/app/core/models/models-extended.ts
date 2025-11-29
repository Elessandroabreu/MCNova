// ========================================
// src/app/core/models/models-extended.ts
// VERSÃO CORRIGIDA - Compatível com o Backend
// ========================================

import { FormaPagamento, Status, TipoOrdemOrcamento } from './enums';

// ==================== AGENDAMENTO ====================
export interface Agendamento {
  cdAgendamento: number;
  
  // Cliente
  cdCliente: number;
  nomeCliente: string;
  cpfCliente: string;
  telefoneCliente: string;
  
  // Veículo
  cdVeiculo: number;
  placaVeiculo: string;
  modeloVeiculo: string;
  marcaVeiculo: string;
  
  // Mecânico
  cdMecanico: number;
  nomeMecanico: string;
  
  // Agendamento
  dataAgendamento: string;
  status: Status;
  observacoes?: string;
  
  // Ordem de Serviço vinculada
  cdOrdemServico?: number;
}

export interface AgendamentoRequest {
  cdCliente: number;
  cdVeiculo: number;
  cdMecanico: number;
  dataAgendamento: string;
  observacoes?: string;
}

// ==================== PRODUTO ====================
// ==================== PRODUTO ====================
export interface Produto {
  cdProduto: number;
  nmProduto: string;
  dsProduto?: string;
  categoria?: string;
  vlProduto: number;     
  qtdEstoque: number;
  qtdMinimoEstoque: number;     
  ativo: boolean;
}

export interface ProdutoRequest {
  nmProduto: string;
  dsProduto?: string;
  categoria?: string;
  vlProduto: number;     
  qtdEstoque: number;
  qtdMinimoEstoque: number;   
}

// ==================== SERVICO ====================
export interface Servico {
  cdServico: number;
  nmServico: string;
  dsServico?: string;
  vlServico: number;
  ativo: boolean;
}

export interface ServicoRequest {
  nmServico: string;
  dsServico?: string;
  vlServico: number;
}

// ==================== ORDEM DE SERVICO ====================
export interface OrdemServico {
  cdOrdemServico: number;
  
  // Cliente
  cdCliente: number;
  nmCliente: string;
  
  // Veículo
  cdVeiculo: number;
  placaVeiculo: string;
  modeloVeiculo: string;
  marcaVeiculo: string;
  
  // Mecânico
  cdMecanico: number;
  nmMecanico: string;
  
  // Dados da OS
  tipoOrdemOrcamento: TipoOrdemOrcamento;
  status: Status;
  dataAgendamento: string;
  dataAbertura: string;
  
  // Valores
  vlPecas: number;
  vlServicos: number;
  vlMaoObraExtra: number;
  vlTotal: number;
  
  diagnostico?: string;
  aprovado: boolean;
  
  itens?: ItemOrdemServico[];
}

export interface OrdemServicoRequest {
  cdCliente: number;
  cdVeiculo: number;
  cdMecanico: number;
  tipoOrdemOrcamento: TipoOrdemOrcamento;
  dataAgendamento?: string;
  vlMaoObraExtra?: number;
  diagnostico?: string;
  itens: ItemOrdemServicoRequest[];
}

// ==================== ITEM ORDEM DE SERVICO ====================
export interface ItemOrdemServico {
  cdItemOrdemServico: number;
  cdProduto?: number;
  nomeProduto?: string;
  cdServico?: number;
  servico?: string;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
}

export interface ItemOrdemServicoRequest {
  cdProduto?: number;
  cdServico?: number;
  quantidade: number;
  vlUnitario?: number;
  
}

// ==================== VENDA ====================
// ✅ CORRIGIDO: Interface compatível com o backend
export interface Venda {
  cdVenda: number;
  dataVenda: string;           // ✅ LocalDateTime no backend
  vlTotal: number;
  desconto?: number;
  formaPagamento: FormaPagamento;
  
  // ✅ CORRIGIDO: Backend retorna objetos aninhados
  clienteModel?: {             // ✅ Backend usa "clienteModel"
    cdCliente: number;
    nmCliente: string;
    nuCPF?: string;
    nuTelefone?: string;
    email?: string;
  };
  
  atendente?: {                // ✅ Backend usa "atendente"
    cdUsuario: number;
    nmUsuario: string;
    email?: string;
  };
  
  itens?: ItemVenda[];
}

export interface VendaRequest {
  cdCliente: number;           // ✅ Obrigatório no backend
  cdAtendente: number;
  desconto?: number;
  formaPagamento: FormaPagamento;
  itens: ItemVendaRequest[];
}

// ==================== ITEM VENDA ====================
export interface ItemVenda {
  cdItemVenda: number;
  cdProduto: number;
  quantidade: number;
  vlUnitario: number;
  vlTotal: number;
  
  // ✅ Produto aninhado (se o backend retornar)
  produto?: {
    cdProduto: number;
    nmProduto: string;
    vlProduto: number;
  };
}

export interface ItemVendaRequest {
  cdProduto: number;
  quantidade: number;
  // ✅ vlUnitario não é necessário no request - backend calcula
}

// ==================== FATURAMENTO ====================
export interface Faturamento {
  cdFaturamento: number;
  cdVenda?: number;
  cdOrdemServico?: number;
  dataVenda: string;
  vlTotal: number;
  formaPagamento: FormaPagamento;
  cliente?: string;
}