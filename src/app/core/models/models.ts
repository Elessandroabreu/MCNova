import { UserRole, AuthProvider, FormaPagamento, StatusAgendamento, StatusOrdemServico, TipoServico } from './enums';

// ==================== USUARIO ====================
export interface Usuario {
  cdUsuario: number;
  nmUsuario: string;
  email: string;
  provider: AuthProvider;
  authProvider: AuthProvider; // Alias para provider (compatibilidade)
  roles: UserRole[];
  nuTelefone?: string;
  nuCPF?: string;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao?: string;
}

export interface UsuarioRequest {
  nmUsuario: string;
  email: string;
  password?: string;
  senha?: string; // Alias para password (compatibilidade)
  provider?: AuthProvider;
  authProvider?: AuthProvider; // Alias para provider (compatibilidade)
  roles: UserRole[];
  nuTelefone?: string;
  nuCPF?: string;
  providerId?: string;
  ativo?: boolean;
}

// ==================== AUTH ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  usuario: Usuario;
}

// ==================== CLIENTE ====================
export interface Cliente {
  cdCliente: number;
  nmCliente: string;
  nuCPF?: string;
  nuTelefone?: string;
  dsEndereco?: string;
  email?: string;
  ativo: boolean;
  dataCadastro: string;
}

export interface ClienteRequest {
  nmCliente: string;
  nuCPF?: string;
  nuTelefone?: string;
  dsEndereco?: string;
  email?: string;
}

// ==================== VEICULO ====================
export interface Veiculo {
  cdVeiculo: number;
  cdCliente: number;
  cliente?: { cdCliente: number; nmCliente: string };
  nmCliente: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor?: string;
  dataCadastro: string;
}

export interface VeiculoRequest {
  cdCliente: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor?: string;
}
