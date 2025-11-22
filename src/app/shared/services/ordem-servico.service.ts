// src/app/shared/services/ordem-servico.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  OrdemServico, 
  OrdemServicoRequestDTO, // ✅ CORRIGIDO
  StatusOrdemServico 
} from '../models/ordem-servico.model';

@Injectable({
  providedIn: 'root',
})
export class OrdemServicoService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/ordens-servico`;

  criar(ordem: OrdemServicoRequestDTO): Observable<OrdemServico> { // ✅ CORRIGIDO
    return this.http.post<OrdemServico>(this.API_URL, ordem);
  }

  buscarPorId(id: number): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.API_URL}/${id}`);
  }

  listarPorStatus(status: StatusOrdemServico): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(`${this.API_URL}/status/${status}`);
  }

  listarOrcamentosPendentes(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(`${this.API_URL}/orcamentos/pendentes`);
  }

  aprovarOrcamento(id: number): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.API_URL}/${id}/aprovar-orcamento`, {});
  }

  concluir(id: number, formaPagamento: string): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(
      `${this.API_URL}/${id}/concluir`, 
      { formaPagamento }
    );
  }

  cancelar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/cancelar`, {});
  }
}