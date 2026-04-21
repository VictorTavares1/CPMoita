import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminServicesService } from '../../../services/admin-services';

@Component({
  selector: 'app-admin-servicos-edit',
  templateUrl: './servicos-edit.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServicosEdit implements OnInit {
  id            = 0;
  titulo        = '';
  descricao     = '';
  iconeOuImagem = '';
  loading = signal(true);
  saving  = signal(false);
  error   = signal('');

  constructor(
    private svc: AdminServicesService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getAll().subscribe({
      next: (list) => {
        const s = list.find(x => x.id === this.id);
        if (s) { this.titulo = s.titulo; this.descricao = s.descricao; this.iconeOuImagem = s.iconeOuImagem; }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  save(): void {
    if (!this.titulo || !this.descricao || !this.iconeOuImagem) {
      this.error.set('Preencha todos os campos obrigatórios.');
      return;
    }
    this.saving.set(true);
    this.svc.update({ id: this.id, titulo: this.titulo, descricao: this.descricao, iconeOuImagem: this.iconeOuImagem }).subscribe({
      next: () => this.router.navigate(['/admin/servicos']),
      error: () => { this.error.set('Erro ao guardar.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
