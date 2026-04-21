import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminContactsService } from '../../../services/admin-contacts';

@Component({
  selector: 'app-admin-contactos-add',
  templateUrl: './contactos-add.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContactosAdd {
  tipo  = '';
  valor = '';
  icone = '';
  saving = signal(false);
  error = signal('');

  readonly tiposDisponiveis = ['telefone', 'email', 'morada', 'facebook', 'instagram', 'website'];

  constructor(private svc: AdminContactsService, private router: Router, private cdr: ChangeDetectorRef) {}

  save(): void {
    if (!this.tipo || !this.valor || !this.icone) {
      this.error.set('Preencha todos os campos obrigatórios.');
      return;
    }
    this.saving.set(true);
    this.svc.create({ tipo: this.tipo, valor: this.valor, icone: this.icone }).subscribe({
      next: () => this.router.navigate(['/admin/contactos']),
      error: () => { this.error.set('Erro ao guardar contacto.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
