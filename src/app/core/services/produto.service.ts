import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produto, ProdutoRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/produtos`;
  
  // ==================== CRUD ====================
  criar(data: ProdutoRequest): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, data);
  }
  
  buscarPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }
  
  listarAtivos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }
  
  listarEstoqueBaixo(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/estoque-baixo`);
  }
  
  atualizar(id: number, data: ProdutoRequest): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, data);
  }
  
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
