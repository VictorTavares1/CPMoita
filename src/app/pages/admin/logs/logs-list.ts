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
  logs: LogItem[] = [];
  total = 0;
  currentPage = 1;
  readonly pageSize = 50;
  loading = signal(true);

  constructor(private svc: AdminLogsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.cdr.markForCheck();
    this.svc.getPage(page, this.pageSize).subscribe({
      next: (res) => {
        this.logs = res.data;
        this.total = res.total;
        this.currentPage = res.page;
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.loadPage(page);
  }

  formatDate(dateHour: string): string {
    const d = new Date(dateHour);
    return d.toLocaleDateString('pt-PT') + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }
}
