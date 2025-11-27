// src/app/core/services/ordem-servico.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrdemServico, OrdemServicoRequest, StatusOrdemServico } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrdemServicoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ordens-servico`;
  
  // ==================== CRIAR E CONSULTAR ====================
  
  /**
   * Criar nova ordem de serviço ou orçamento
   */
  criar(data: OrdemServicoRequest): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.apiUrl, data);
  }
  
  /**
   * Buscar ordem de serviço por ID
   */
  buscarPorId(id: number): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Listar ordens por status
   */
  listarPorStatus(status: StatusOrdemServico): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(`${this.apiUrl}/status/${status}`);
  }
  
  /**
   * Listar orçamentos pendentes de aprovação
   */
  listarOrcamentosPendentes(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(`${this.apiUrl}/orcamentos/pendentes`);
  }
  
  // ==================== ATUALIZAR ====================
  
  /**
   * Atualizar ordem de serviço (observações e diagnóstico)
   */
  atualizar(id: number, data: OrdemServicoRequest): Observable<OrdemServico> {
    return this.http.put<OrdemServico>(`${this.apiUrl}/${id}`, data);
  }
  
  // ==================== MUDANÇAS DE STATUS ====================
  
  /**
   * ✅ NOVO: Aprovar orçamento e criar agendamento
   * Orçamento → Ordem de Serviço
   */
  aprovarOrcamento(id: number, dataAgendamento?: string): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(
      `${this.apiUrl}/${id}/aprovar-orcamento`, 
      { dataAgendamento }
    );
  }
  
  /**
   * ✅ NOVO: Iniciar ordem de serviço
   * AGUARDANDO → EM_ANDAMENTO
   */
  iniciar(id: number): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.apiUrl}/${id}/iniciar`, {});
  }
  
  /**
   * ✅ NOVO: Concluir ordem de serviço e gerar faturamento
   * EM_ANDAMENTO → CONCLUIDA
   */
  concluir(id: number, formaPagamento: string): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(
      `${this.apiUrl}/${id}/concluir`, 
      { formaPagamento }
    );
  }
  
  /**
   * ✅ NOVO: Cancelar ordem de serviço e devolver peças
   * → CANCELADA
   */
  cancelar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}