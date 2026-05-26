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

  get pwdHasLength(): boolean { return this.password.length >= 8 && this.password.length <= 32; }
  get pwdHasUpper(): boolean  { return /[A-Z]/.test(this.password); }
  get pwdHasDigit(): boolean  { return /[0-9]/.test(this.password); }
  get pwdHasSpecial(): boolean { return /[!@#$%^&*()\-_+=]/.test(this.password); }
  get pwdValid(): boolean { return this.pwdHasLength && this.pwdHasUpper && this.pwdHasDigit && this.pwdHasSpecial; }

  get emailValid(): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()); }

  submit(): void {
    this.error.set('');
    if (!this.emailValid || !this.pwdValid) {
      this.error.set('Corrija os erros antes de submeter.');
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
