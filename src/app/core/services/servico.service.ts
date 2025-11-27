// src/app/core/services/servico.service.ts
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
  
  // Criar novo servico
  criar(data: ServicoRequest): Observable<Servico> {
    return this.http.post<Servico>(this.apiUrl, data);
  }
  
  // Buscar por ID
  buscarPorId(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.apiUrl}/${id}`);
  }
  
  // Listar ativos
  listarAtivos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.apiUrl);
  }
  
  // Atualizar servico
  atualizar(id: number, data: ServicoRequest): Observable<Servico> {
    return this.http.put<Servico>(`${this.apiUrl}/${id}`, data);
  }
  
  // Deletar servico
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}