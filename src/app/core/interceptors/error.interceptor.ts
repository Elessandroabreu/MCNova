import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro desconhecido';
      
      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente (rede, etc)
        errorMessage = `Erro de conexão: ${error.error.message}`;
      } else {
        // Erro do lado do servidor
        switch (error.status) {
          case 0:
            // Erro de CORS ou backend offline
            errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
            break;
            
          case 401:
            // Não autorizado - faz logout
            authService.logout();
            errorMessage = 'Sessão expirada. Faça login novamente.';
            break;
            
          case 403:
            // Sem permissão
            errorMessage = 'Você não tem permissão para acessar este recurso.';
            router.navigate(['/dashboard']);
            break;
            
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
            
          case 400:
            // Erro de validação - pega mensagem do backend
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.error?.errors) {
              // Se tem múltiplos erros de validação
              const errors = error.error.errors;
              const firstError = Object.values(errors)[0];
              errorMessage = `Erro de validação: ${firstError}`;
            } else {
              errorMessage = 'Dados inválidos. Verifique os campos.';
            }
            break;
            
          case 500:
            errorMessage = error.error?.message || 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
            
          default:
            // Tenta pegar mensagem do backend
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
        }
      }
      
      console.error('Erro HTTP:', {
        status: error.status,
        message: errorMessage,
        error: error
      });
      
      // Retorna erro com mensagem tratada
      return throwError(() => ({ message: errorMessage, error }));
    })
  );
};