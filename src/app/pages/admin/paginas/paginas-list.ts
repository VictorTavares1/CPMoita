import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminPageContentsService, AdminPageContent } from '../../../services/admin-page-contents';

@Component({
  selector: 'app-admin-paginas',
  templateUrl: './paginas-list.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPaginas implements OnInit {
  contents: AdminPageContent[] = [];
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');

  constructor(private svc: AdminPageContentsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: (data) => { this.contents = data; this.loading.set(false); this.cdr.markForCheck(); },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  pageLabel(nomePagina: string): string {
    const labels: Record<string, string> = {
      inicio: 'Início', sobre_nos: 'Sobre Nós', contactos: 'Contactos'
    };
    return labels[nomePagina] ?? nomePagina;
  }
}
