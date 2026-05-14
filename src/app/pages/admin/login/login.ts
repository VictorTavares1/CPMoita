import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLogin {
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);
  sessionExpired = signal(false);
  showPassword = signal(false);

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
    // Detectar redirecionamento por sessão expirada (vem do authErrorInterceptor)
    const nav = this.router.getCurrentNavigation();
    if ((nav?.extras?.state as { sessionExpired?: boolean })?.sessionExpired) {
      this.sessionExpired.set(true);
    }
  }

  onSubmit(): void {
    this.error.set('');
    this.sessionExpired.set(false);
    this.loading.set(true);

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.error.set('Email ou password incorretos.');
        } else if (err.status === 429) {
          this.error.set('Demasiadas tentativas. Aguarde 15 minutos.');
        } else {
          this.error.set('Erro de ligação. Tente novamente.');
        }
        this.cdr.markForCheck();
      },
    });
  }
}
