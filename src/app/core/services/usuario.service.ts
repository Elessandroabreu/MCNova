import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;
  
  // ==================== CRUD ====================
  criar(data: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, data);
  }
  
  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }
  
  listarAtivos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
  
  listarMecanicos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/mecanicos`);
  }
  
  atualizar(id: number, data: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data);
  }
  
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
