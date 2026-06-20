import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminOrgaosSociaisService } from '../../../services/admin-orgaos-sociais';

@Component({
  selector: 'app-admin-orgaos-sociais-edit',
  templateUrl: './orgaos-sociais-edit.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrgaosSociaisEdit implements OnInit {
  id     = 0;
  cargo  = '';
  secao  = '';
  nome   = '';
  loading = signal(true);
  saving  = signal(false);
  error   = signal('');

  constructor(
    private svc: AdminOrgaosSociaisService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getAll().subscribe({
      next: (list) => {
        const m = list.find(x => x.id === this.id);
        if (m) { this.cargo = m.cargo; this.secao = m.secao; this.nome = m.nome; }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  save(): void {
    if (!this.cargo.trim() || !this.secao || !this.nome.trim()) {
      this.error.set('Todos os campos são obrigatórios.');
      this.cdr.markForCheck();
      return;
    }
    this.saving.set(true);
    this.svc.update({ id: this.id, cargo: this.cargo.trim(), secao: this.secao, nome: this.nome.trim() }).subscribe({
      next: () => this.router.navigate(['/admin/orgaos-sociais']),
      error: () => { this.error.set('Erro ao guardar. Tente novamente.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
