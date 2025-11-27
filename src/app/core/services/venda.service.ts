// src/app/core/services/venda.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Venda, VendaRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vendas`;
  
  // Criar nova venda
  criar(data: VendaRequest): Observable<Venda> {
    return this.http.post<Venda>(this.apiUrl, data);
  }
  
  // Buscar por ID
  buscarPorId(id: number): Observable<Venda> {
    return this.http.get<Venda>(`${this.apiUrl}/${id}`);
  }
  
  // Listar todas
  listarTodas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(this.apiUrl);
  }
  
  // Listar por cliente
  listarPorCliente(cdCliente: number): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.apiUrl}/cliente/${cdCliente}`);
  }
  
  // Listar por atendente
  listarPorAtendente(cdAtendente: number): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.apiUrl}/atendente/${cdAtendente}`);
  }
  
  // Listar por periodo
  listarPorPeriodo(dataInicio: string, dataFim: string): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.apiUrl}/periodo`, {
      params: { dataInicio, dataFim }
    });
  }
  
  // Calcular total do dia
  calcularTotalDia(): Observable<{ totalDia: number }> {
    return this.http.get<{ totalDia: number }>(`${this.apiUrl}/total-dia`);
  }
}