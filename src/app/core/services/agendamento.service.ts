import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Agendamento, AgendamentoRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/agendamentos`;
  
  // ==================== CRUD ====================
  criar(data: AgendamentoRequest): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.apiUrl, data);
  }
  
  buscarPorId(id: number): Observable<Agendamento> {
    return this.http.get<Agendamento>(`${this.apiUrl}/${id}`);
  }
  
  listarPorMecanico(cdMecanico: number): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}/mecanico/${cdMecanico}`);
  }
  
  listarFuturos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}/futuros`);
  }
  
  atualizar(id: number, data: AgendamentoRequest): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.apiUrl}/${id}`, data);
  }
  
  cancelar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
