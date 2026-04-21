import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminPageContentsService } from '../../../services/admin-page-contents';

@Component({
  selector: 'app-admin-paginas-edit',
  templateUrl: './paginas-edit.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPaginasEdit implements OnInit {
  id             = 0;
  chave          = '';
  pagina         = '';
  tipo           = '';
  conteudoPagina = '';
  loading = signal(true);
  saving  = signal(false);
  error   = signal('');

  constructor(
    private svc: AdminPageContentsService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getAll().subscribe({
      next: (list) => {
        const c = list.find(x => x.id === this.id);
        if (c) {
          this.chave = c['chaveSecção'];
          this.pagina = c.nomePagina;
          this.tipo = c.tipoConteudo;
          this.conteudoPagina = c.conteudoPagina;
        }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  save(): void {
    this.saving.set(true);
    this.svc.update(this.id, this.conteudoPagina).subscribe({
      next: () => this.router.navigate(['/admin/paginas']),
      error: () => { this.error.set('Erro ao guardar.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
