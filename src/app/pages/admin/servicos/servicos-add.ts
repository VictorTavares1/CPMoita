import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminServicesService } from '../../../services/admin-services';

@Component({
  selector: 'app-admin-servicos-add',
  templateUrl: './servicos-add.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServicosAdd {
  titulo        = '';
  descricao     = '';
  iconeOuImagem = '';
  saving = signal(false);
  error  = signal('');

  constructor(private svc: AdminServicesService, private router: Router, private cdr: ChangeDetectorRef) {}

  save(): void {
    if (!this.titulo || !this.descricao || !this.iconeOuImagem) {
      this.error.set('Preencha todos os campos obrigatórios.');
      return;
    }
    this.saving.set(true);
    this.svc.create({ titulo: this.titulo, descricao: this.descricao, iconeOuImagem: this.iconeOuImagem }).subscribe({
      next: () => this.router.navigate(['/admin/servicos']),
      error: () => { this.error.set('Erro ao guardar serviço.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
