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
  
  // ==================== LOGIN ====================
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }
  
  // ==================== REGISTER ====================
  register(data: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/register`, data);
  }
  
  // ==================== GOOGLE LOGIN ====================
  loginWithGoogle(): void {
    const googleAuthUrl = `${environment.apiUrl.replace('/api', '')}/oauth2/authorization/google`;
    window.location.href = googleAuthUrl;
  }
  
  // ==================== CALLBACK GOOGLE ====================
  handleGoogleCallback(token: string): void {
    // Busca dados do usuário com o token recebido
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
      error: () => {
        this.router.navigate(['/auth/login'], { 
          queryParams: { error: 'google_auth_failed' } 
        });
      }
    });
  }
  
  // ==================== LOGOUT ====================
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
  
  // ==================== GET CURRENT USER ====================
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }
  
  // ==================== GET TOKEN ====================
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  // ==================== IS AUTHENTICATED ====================
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  // ==================== HAS ROLE ====================
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role as any) || false;
  }
  
  // ==================== HAS ANY ROLE ====================
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
  
  // ==================== PRIVATE METHODS ====================
  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
    this.currentUserSubject.next(response.usuario);
    
    // Redireciona para dashboard
    this.router.navigate(['/dashboard']);
  }
  
  private getUserFromStorage(): Usuario | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
