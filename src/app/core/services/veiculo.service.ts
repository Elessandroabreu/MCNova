import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Veiculo, VeiculoRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VeiculoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/veiculos`;
  
  // ==================== CRUD ====================
  criar(data: VeiculoRequest): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.apiUrl, data);
  }
  
  buscarPorId(id: number): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.apiUrl}/${id}`);
  }
  
  listarTodos(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.apiUrl);
  }
  
  listarPorCliente(cdCliente: number): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(`${this.apiUrl}/cliente/${cdCliente}`);
  }
  
  atualizar(id: number, data: VeiculoRequest): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.apiUrl}/${id}`, data);
  }
  
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
