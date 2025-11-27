// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse, Usuario, UsuarioRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly TOKEN_KEY = 'sgm_token';
  private readonly USER_KEY = 'sgm_user';
  
  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor() {}
  
  // Login com email e senha
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }
  
  // Registro de novo usuario
  register(data: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/register`, data);
  }
  
  // Login com Google - redireciona para backend OAuth2
  loginWithGoogle(): void {
    const googleAuthUrl = `${environment.apiUrl.replace('/api', '')}/oauth2/authorization/google`;
    window.location.href = googleAuthUrl;
  }
  
  // Callback do Google - processa token recebido
  handleGoogleCallback(token: string): void {
    this.http.get<Usuario>(`${environment.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (usuario) => {
        const authResponse: AuthResponse = {
          accessToken: token,
          tokenType: 'Bearer',
          usuario: usuario
        };
        this.handleAuthSuccess(authResponse);
      },
      error: (error) => {
        console.error('Erro no callback do Google:', error);
        this.router.navigate(['/auth/login'], { 
          queryParams: { error: 'google_auth_failed' } 
        });
      }
    });
  }
  
  // Logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
  
  // Obter usuario atual
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }
  
  // Obter token JWT
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  // Verificar se esta autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  // Verificar se tem role especifica
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role as any) || false;
  }
  
  // Verificar se tem alguma das roles
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
  
  // Processar sucesso da autenticacao
  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
    this.currentUserSubject.next(response.usuario);
    this.router.navigate(['/dashboard']);
  }
  
  // Recuperar usuario do localStorage
  private getUserFromStorage(): Usuario | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}