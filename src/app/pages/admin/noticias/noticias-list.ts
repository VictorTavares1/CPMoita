import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminNewsService, AdminNewsItem } from '../../../services/admin-news';

@Component({
  selector: 'app-admin-noticias',
  templateUrl: './noticias-list.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNoticias implements OnInit {
  news: AdminNewsItem[] = [];
  total = 0;
  currentPage = 1;
  readonly pageSize = 20;
  tab: 'active' | 'inactive' = 'active';
  search = '';
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');

  constructor(private svc: AdminNewsService, private cdr: ChangeDetectorRef, private router: Router) {
    const state = this.router.getCurrentNavigation()?.extras?.state as { toast?: string } | undefined;
    if (state?.toast) this.showToast(state.toast, 'success');
  }

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    const stateFilter = this.tab === 'active' ? 1 : 2;
    this.svc.getPage(page, this.pageSize, this.search, stateFilter).subscribe({
      next: (res) => {
        this.news = res.data;
        this.total = res.total;
        this.currentPage = res.page;
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  onSearchChange(): void {
    this.loadPage(1);
  }

  onTabChange(tab: 'active' | 'inactive'): void {
    this.tab = tab;
    this.loadPage(1);
  }

  clearFilters(): void {
    this.search = '';
    this.loadPage(1);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get pageNumbers(): number[] {
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.loadPage(page);
  }

  toggleState(news: AdminNewsItem): void {
    const action = news.idState === 1 ? 'desativar' : 'reativar';
    if (!confirm(`Tem a certeza que deseja ${action} esta notícia?`)) return;
    this.svc.toggleState(news.id).subscribe({
      next: () => {
        const msg = news.idState === 1 ? 'Notícia desativada.' : 'Notícia reativada.';
        this.showToast(msg, 'success');
        this.loadPage(this.currentPage); // recarregar a página actual
      },
      error: () => this.showToast('Erro ao alterar estado.', 'danger')
    });
  }

  showToast(msg: string, type: string): void {
    this.toastType.set(type);
    this.toast.set(msg);
    setTimeout(() => { this.toast.set(''); this.cdr.markForCheck(); }, 3500);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
