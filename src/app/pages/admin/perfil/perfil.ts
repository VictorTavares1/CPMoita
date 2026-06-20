import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-perfil',
  templateUrl: './perfil.html',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPerfil implements OnInit {
  email = '';
  pwdAtual = '';
  novaPwd = '';
  confirmarPwd = '';

  loading = signal(true);
  saving  = signal(false);
  error   = signal('');
  success = signal('');

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get<{ email: string }>(environment.apiUrl + '/admin-perfil.php', { withCredentials: true }).subscribe({
      next: (res) => {
        this.email = res.email;
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  save(): void {
    if (!this.pwdAtual && !this.novaPwd && !this.confirmarPwd) {
      this.error.set('Preencha os campos para alterar a palavra-passe.');
      this.cdr.markForCheck();
      return;
    }

    this.error.set('');
    this.success.set('');
    this.saving.set(true);

    this.http.put<{ success: boolean }>(
      environment.apiUrl + '/admin-perfil.php',
      { pwdAtual: this.pwdAtual, novaPwd: this.novaPwd, confirmarPwd: this.confirmarPwd },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.success.set('Palavra-passe alterada com sucesso.');
        this.pwdAtual = '';
        this.novaPwd = '';
        this.confirmarPwd = '';
        this.saving.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Erro ao guardar.');
        this.saving.set(false);
        this.cdr.markForCheck();
      }
    });
  }
}
