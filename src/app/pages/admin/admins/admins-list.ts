import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAdminsService, AdminItem } from '../../../services/admin-admins';

@Component({
  selector: 'app-admin-admins',
  templateUrl: './admins-list.html',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAdmins implements OnInit {
  allAdmins: AdminItem[] = [];
  filtered: AdminItem[] = [];
  paged: AdminItem[] = [];
  search = '';
  currentPage = 1;
  readonly pageSize = 10;
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');

  email = '';
  password = '';
  showPassword = false;
  addError = signal('');
  addLoading = signal(false);

  constructor(private svc: AdminAdminsService, private cdr: ChangeDetectorRef, private router: Router) {
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

  addAdmin(): void {
    this.addError.set('');
    if (!this.email.trim() || !this.password) {
      this.addError.set('Email e password são obrigatórios.');
      this.cdr.markForCheck();
      return;
    }
    this.addLoading.set(true);
    this.svc.add(this.email.trim(), this.password).subscribe({
      next: () => {
        this.email = '';
        this.password = '';
        this.addLoading.set(false);
        this.showToast('Administrador adicionado com sucesso.', 'success');
        this.load();
      },
      error: (err) => {
        this.addLoading.set(false);
        this.addError.set(err.error?.error ?? 'Erro ao adicionar administrador.');
        this.cdr.markForCheck();
      }
    });
  }

  toggleState(admin: AdminItem): void {
    if (admin.email === 'admin@cpm.com') return;
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
