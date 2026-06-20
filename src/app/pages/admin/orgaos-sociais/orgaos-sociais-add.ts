import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminOrgaosSociaisService } from '../../../services/admin-orgaos-sociais';

@Component({
  selector: 'app-admin-orgaos-sociais-add',
  templateUrl: './orgaos-sociais-add.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrgaosSociaisAdd {
  cargo = '';
  secao = '';
  nome  = '';
  saving = signal(false);
  error  = signal('');

  constructor(private svc: AdminOrgaosSociaisService, private router: Router, private cdr: ChangeDetectorRef) {}

  save(): void {
    if (!this.cargo.trim() || !this.secao || !this.nome.trim()) {
      this.error.set('Todos os campos são obrigatórios.');
      this.cdr.markForCheck();
      return;
    }
    this.saving.set(true);
    this.svc.create({ cargo: this.cargo.trim(), secao: this.secao, nome: this.nome.trim() }).subscribe({
      next: () => this.router.navigate(['/admin/orgaos-sociais']),
      error: () => { this.error.set('Erro ao guardar. Tente novamente.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
