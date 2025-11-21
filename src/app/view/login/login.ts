// src/app/view/login/login.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  protected form!: FormGroup;
  protected submitted: boolean = false;
  protected loading: boolean = false;
  protected errorMessage: string = '';

  ngOnInit(): void {
    // Se já está logado, redireciona
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    // ✅ CORRIGIDO: Usar 'password' ao invés de 'senha'
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]], // ✅ MUDOU AQUI!
    });
  }

  // Login local
  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      console.log('Formulário inválido:', this.form.errors);
      return;
    }

    this.loading = true;

    // 🔍 DEBUG: Mostrar dados sendo enviados
    console.log('=== TENTATIVA DE LOGIN ===');
    console.log('Email:', this.form.value.email);
    console.log('Password enviado:', this.form.value.password ? '***' : 'VAZIO');
    console.log('Payload completo:', JSON.stringify(this.form.value));

    this.authService.login(this.form.value).subscribe({
      next: (response) => {
        console.log('✅ Login bem-sucedido!');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Erro no login:', error);
        
        if (error.status === 0) {
          this.errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else if (error.status === 401) {
          this.errorMessage = 'Email ou senha incorretos';
        } else if (error.status === 400) {
          this.errorMessage = 'Dados inválidos. Verifique email e senha.';
        } else {
          this.errorMessage = 'Erro ao fazer login. Tente novamente.';
        }
      },
    });
  }

  // Login com Google OAuth2
  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  isInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return (control?.invalid && this.submitted) ?? false;
  }
}