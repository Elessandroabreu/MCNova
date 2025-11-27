// src/app/core/services/usuario.service.ts
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
  
  // Criar novo usuario
  criar(data: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, data);
  }
  
  // Buscar por ID
  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }
  
  // Listar ativos
  listarAtivos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
  
  // Listar mecanicos
  listarMecanicos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/mecanicos`);
  }
  
  // ✅ NOVO: Listar atendentes
  listarAtendentes(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/atendentes`);
  }
  
  // Atualizar usuario
  atualizar(id: number, data: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data);
  }
  
  // Deletar usuario
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}