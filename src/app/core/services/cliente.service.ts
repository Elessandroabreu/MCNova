import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, ClienteRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clientes`;
  
  // ==================== CRUD ====================
  criar(data: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, data);
  }
  
  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }
  
  listarAtivos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }
  
  atualizar(id: number, data: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, data);
  }
  
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
