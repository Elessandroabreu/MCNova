import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Venda, VendaRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vendas`;
  
  // ==================== CRUD ====================
  criar(data: VendaRequest): Observable<Venda> {
    return this.http.post<Venda>(this.apiUrl, data);
  }
  
  buscarPorId(id: number): Observable<Venda> {
    return this.http.get<Venda>(`${this.apiUrl}/${id}`);
  }
  
  listarTodas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(this.apiUrl);
  }
  
  listarPorCliente(cdCliente: number): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.apiUrl}/cliente/${cdCliente}`);
  }
  
  listarPorAtendente(cdAtendente: number): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.apiUrl}/atendente/${cdAtendente}`);
  }
  
  listarPorPeriodo(dataInicio: string, dataFim: string): Observable<Venda[]> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);
    return this.http.get<Venda[]>(`${this.apiUrl}/periodo`, { params });
  }
  
  calcularTotalDia(): Observable<{ totalDia: number }> {
    return this.http.get<{ totalDia: number }>(`${this.apiUrl}/total-dia`);
  }
}
