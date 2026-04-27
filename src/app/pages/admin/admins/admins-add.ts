import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAdminsService } from '../../../services/admin-admins';

@Component({
  selector: 'app-admin-admins-add',
  templateUrl: './admins-add.html',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAdminsAdd {
  email = '';
  password = '';
  showPassword = false;
  loading = signal(false);
  error = signal('');

  constructor(private svc: AdminAdminsService, private router: Router, private cdr: ChangeDetectorRef) {}

  submit(): void {
    this.error.set('');
    if (!this.email.trim() || !this.password) {
      this.error.set('Email e password são obrigatórios.');
      this.cdr.markForCheck();
      return;
    }
    this.loading.set(true);
    this.svc.add(this.email.trim(), this.password).subscribe({
      next: () => this.router.navigate(['/admin/administradores'], { state: { toast: 'Administrador adicionado com sucesso.' } }),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error ?? 'Erro ao adicionar administrador.');
        this.cdr.markForCheck();
      }
    });
  }
}
