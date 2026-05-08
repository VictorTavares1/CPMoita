import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAdminsService, AdminItem } from '../../../services/admin-admins';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-admins',
  templateUrl: './admins-list.html',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAdmins implements OnInit {
  allAdmins: AdminItem[] = [];
  filtered: AdminItem[] = [];
  paged: AdminItem[] = [];
  tab: 'active' | 'inactive' = 'active';
  search = '';
  currentPage = 1;
  readonly pageSize = 10;
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');

  constructor(private svc: AdminAdminsService, private cdr: ChangeDetectorRef, private router: Router, private auth: AuthService) {
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
        this.allAdmins = data;
        this.applyFilters();
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  applyFilters(): void {
    let result = [...this.allAdmins];
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      result = result.filter(a => a.email.toLowerCase().includes(q));
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
    this.cdr.markForCheck();
  }

  isCurrentUser(admin: AdminItem): boolean {
    return admin.email === this.auth.getEmail();
  }

  get activeAdmins(): AdminItem[] {
    return this.filtered.filter(a => a.idState === 1);
  }

  get inactiveAdmins(): AdminItem[] {
    return this.filtered.filter(a => a.idState === 2);
  }

  toggleState(admin: AdminItem): void {
    if (this.isCurrentUser(admin)) return;
    const action = admin.idState === 1 ? 'desativar' : 'reativar';
    if (!confirm(`Tem a certeza que deseja ${action} este administrador?`)) return;
    this.svc.toggleState(admin.id).subscribe({
      next: () => {
        admin.idState = admin.idState === 1 ? 2 : 1;
        this.applyFilters();
        this.showToast(admin.idState === 2 ? 'Administrador desativado.' : 'Administrador reativado.', 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.showToast(err.error?.error ?? 'Erro ao alterar estado.', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  showToast(msg: string, type: string): void {
    this.toastType.set(type);
    this.toast.set(msg);
    setTimeout(() => { this.toast.set(''); this.cdr.markForCheck(); }, 3500);
  }
}
