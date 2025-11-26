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
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        // Erro do lado do servidor
        switch (error.status) {
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
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
        }
      }
      
      // Você pode adicionar um serviço de toast/notification aqui
      console.error(errorMessage);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
