import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminContactsService } from '../../../services/admin-contacts';

@Component({
  selector: 'app-admin-contactos-edit',
  templateUrl: './contactos-edit.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContactosEdit implements OnInit {
  id = 0;
  tipo  = '';
  valor = '';
  icone = '';
  loading = signal(true);
  saving  = signal(false);
  error   = signal('');

  readonly tiposDisponiveis = ['telefone', 'email', 'morada', 'facebook', 'instagram', 'website'];

  constructor(
    private svc: AdminContactsService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getAll().subscribe({
      next: (list) => {
        const c = list.find(x => x.id === this.id);
        if (c) { this.tipo = c.tipo; this.valor = c.valor; this.icone = c.icone; }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  save(): void {
    if (!this.tipo || !this.valor || !this.icone) {
      this.error.set('Preencha todos os campos obrigatórios.');
      return;
    }
    this.saving.set(true);
    this.svc.update({ id: this.id, tipo: this.tipo, valor: this.valor, icone: this.icone }).subscribe({
      next: () => this.router.navigate(['/admin/contactos']),
      error: () => { this.error.set('Erro ao guardar.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
