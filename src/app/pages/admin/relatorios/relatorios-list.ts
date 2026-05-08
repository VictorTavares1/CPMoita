import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminReportsService, AdminReportItem } from '../../../services/admin-reports';

@Component({
  selector: 'app-admin-relatorios',
  templateUrl: './relatorios-list.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRelatorios implements OnInit {
  allDocs: AdminReportItem[] = [];
  filtered: AdminReportItem[] = [];
  paged: AdminReportItem[] = [];
  tab: 'active' | 'inactive' = 'active';
  search = '';
  currentPage = 1;
  readonly pageSize = 10;
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');

  constructor(private svc: AdminReportsService, private cdr: ChangeDetectorRef, private router: Router) {
    const state = this.router.getCurrentNavigation()?.extras?.state as { toast?: string } | undefined;
    if (state?.toast) this.showToast(state.toast, 'success');
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => {
        this.allDocs = data;
        this.applyFilters();
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  applyFilters(): void {
    let result = [...this.allDocs];
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      result = result.filter(d => d.title.toLowerCase().includes(q));
    }
    this.filtered = result;
    this.currentPage = 1;
    this.updatePaged();
  }

  updatePaged(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paged = this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaged();
    this.cdr.markForCheck();
  }

  clearFilters(): void {
    this.search = '';
    this.applyFilters();
  }

  get activeDocs(): AdminReportItem[] {
    return this.filtered.filter(d => d.idState === 1);
  }

  get inactiveDocs(): AdminReportItem[] {
    return this.filtered.filter(d => d.idState === 2);
  }

  toggleState(doc: AdminReportItem): void {
    const action = doc.idState === 1 ? 'desativar' : 'reativar';
    if (!confirm(`Tem a certeza que deseja ${action} este relatório?`)) return;
    this.svc.toggleState(doc.id).subscribe({
      next: () => {
        doc.idState = doc.idState === 1 ? 2 : 1;
        this.applyFilters();
        this.showToast(doc.idState === 2 ? 'Relatório desativado.' : 'Relatório reativado.', 'success');
        this.cdr.markForCheck();
      },
      error: () => { this.showToast('Erro ao alterar estado.', 'danger'); this.cdr.markForCheck(); }
    });
  }

  showToast(msg: string, type: string): void {
    this.toastType.set(type);
    this.toast.set(msg);
    setTimeout(() => { this.toast.set(''); this.cdr.markForCheck(); }, 3500);
  }
}
