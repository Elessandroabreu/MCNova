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
  
  // ==================== CRUD ====================
  criar(data: OrdemServicoRequest): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.apiUrl, data);
  }
  
  buscarPorId(id: number): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.apiUrl}/${id}`);
  }
  
  listarPorStatus(status: StatusOrdemServico): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(`${this.apiUrl}/status/${status}`);
  }
  
  listarOrcamentosPendentes(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(`${this.apiUrl}/orcamentos/pendentes`);
  }
  
  // ==================== AÇÕES ====================
  aprovarOrcamento(id: number): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.apiUrl}/${id}/aprovar-orcamento`, {});
  }
  
  concluir(id: number, formaPagamento: string): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.apiUrl}/${id}/concluir`, { formaPagamento });
  }
  
  cancelar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
