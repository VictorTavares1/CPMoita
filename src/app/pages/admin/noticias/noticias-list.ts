import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminNewsService, AdminNewsItem } from '../../../services/admin-news';

@Component({
  selector: 'app-admin-noticias',
  templateUrl: './noticias-list.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNoticias implements OnInit {
  allNews: AdminNewsItem[] = [];
  filtered: AdminNewsItem[] = [];
  search = '';
  dateFrom = '';
  dateTo = '';
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');

  constructor(private svc: AdminNewsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => {
        this.allNews = data;
        this.applyFilters();
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  applyFilters(): void {
    let result = [...this.allNews];
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q));
    }
    if (this.dateFrom && this.dateTo) {
      const from = new Date(this.dateFrom);
      const to = new Date(this.dateTo);
      result = result.filter(n => {
        const d = new Date(n.dateHour);
        return d >= from && d <= to;
      });
    }
    this.filtered = result;
  }

  clearFilters(): void {
    this.search = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  toggleState(news: AdminNewsItem): void {
    const action = news.idState === 1 ? 'desativar' : 'reativar';
    if (!confirm(`Tem a certeza que deseja ${action} esta notícia?`)) return;
    this.svc.toggleState(news.id).subscribe({
      next: () => {
        news.idState = news.idState === 1 ? 2 : 1;
        this.applyFilters();
        this.showToast(news.idState === 2 ? 'Notícia desativada.' : 'Notícia reativada.', 'success');
        this.cdr.markForCheck();
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
