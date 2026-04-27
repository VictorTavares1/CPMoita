import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminLogsService, LogItem } from '../../../services/admin-logs';

@Component({
  selector: 'app-admin-logs',
  templateUrl: './logs-list.html',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLogs implements OnInit {
  allLogs: LogItem[] = [];
  filtered: LogItem[] = [];
  paged: LogItem[] = [];
  search = '';
  currentPage = 1;
  readonly pageSize = 10;
  loading = signal(true);

  constructor(private svc: AdminLogsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: (data) => {
        this.allLogs = data;
        this.applyFilters();
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  applyFilters(): void {
    const q = this.search.trim().toLowerCase();
    this.filtered = q
      ? this.allLogs.filter(l => l.userEmail.toLowerCase().includes(q))
      : [...this.allLogs];
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
    this.cdr.markForCheck();
  }

  formatDate(dateHour: string): string {
    const d = new Date(dateHour);
    return d.toLocaleDateString('pt-PT') + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }
}
