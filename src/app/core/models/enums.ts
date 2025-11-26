// Enums correspondentes ao backend

export enum UserRole {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_ATENDENTE = 'ROLE_ATENDENTE',
  ROLE_MECANICO = 'ROLE_MECANICO'
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE'
}

export enum FormaPagamento {
  DINHEIRO = 'DINHEIRO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  PIX = 'PIX'
}

export enum StatusAgendamento {
  AGENDADO = 'AGENDADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export enum StatusOrdemServico {
  AGUARDANDO = 'AGUARDANDO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA'
}

export enum TipoServico {
  ORCAMENTO = 'ORCAMENTO',
  ORDEM_DE_SERVICO = 'ORDEM_DE_SERVICO'
}
