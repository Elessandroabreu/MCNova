import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servico, ServicoRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/servicos`;
  
  // ==================== CRUD ====================
  criar(data: ServicoRequest): Observable<Servico> {
    return this.http.post<Servico>(this.apiUrl, data);
  }
  
  buscarPorId(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.apiUrl}/${id}`);
  }
  
  listarAtivos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.apiUrl);
  }
  
  atualizar(id: number, data: ServicoRequest): Observable<Servico> {
    return this.http.put<Servico>(`${this.apiUrl}/${id}`, data);
  }
  
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
