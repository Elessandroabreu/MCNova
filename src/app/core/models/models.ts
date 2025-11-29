// ========================================
// src/app/core/models/models.ts
// VERSÃO CORRIGIDA - Compatível com o Backend
// ========================================

import { UserRole, AuthProvider } from './enums';

// ==================== USUARIO ====================
export interface Usuario {
  cdUsuario: number;
  nmUsuario: string;
  email: string;
  provider: AuthProvider;
  roles: UserRole[];
  telefone?: string;
  cpf?: string;
  ativo: boolean;
}

export interface UsuarioRequest {
  nmUsuario: string;
  email: string;
  senha?: string;
  provider?: AuthProvider;
  authProvider?: AuthProvider; // Alias para compatibilidade
  roles: UserRole[];
  telefone?: string;
  cpf?: string;
  providerId?: string;
  ativo?: boolean;
}

// ==================== AUTH ====================
export interface LoginRequest {
  email: string;
  senha: string;
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
  cpf?: string;
  telefone?: string;
  endereco?: string;
  email?: string;
  ativo: boolean;
}

export interface ClienteRequest {
  nmCliente: string;
  cpf?: string;
  telefone?: string;
  dsEndereco?: string;
  email?: string;
}

// ==================== VEICULO ====================
export interface Veiculo {
  cdVeiculo: number;
  cdCliente: number;
  placa: string;
  modelo: string;
  marca?: string;
  ano?: number;
  cor?: string;
  cliente?: {  // ✅ Objeto cliente aninhado
    cdCliente: number;
    nmCliente: string;
  };
}

export interface VeiculoRequest {
  cdCliente: number;
  placa: string;
  modelo: string;
  marca?: string;
  ano?: number;
  cor?: string;
}