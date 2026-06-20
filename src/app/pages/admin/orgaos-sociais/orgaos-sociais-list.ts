import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminOrgaosSociaisService, AdminOrgaoSocial } from '../../../services/admin-orgaos-sociais';

@Component({
  selector: 'app-admin-orgaos-sociais',
  templateUrl: './orgaos-sociais-list.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrgaosSociais implements OnInit {
  members: AdminOrgaoSocial[] = [];
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');
  tab: 'active' | 'inactive' = 'active';

  readonly pageSize = 10;
  currentPage = 1;

  constructor(private svc: AdminOrgaosSociaisService, public cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.members = data; this.loading.set(false); this.cdr.markForCheck(); },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  get activeMembers(): AdminOrgaoSocial[] { return this.members.filter(m => m.idState === 1); }
  get inactiveMembers(): AdminOrgaoSocial[] { return this.members.filter(m => m.idState === 2); }

  get filtered(): AdminOrgaoSocial[] {
    return this.tab === 'active' ? this.activeMembers : this.inactiveMembers;
  }

  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  get paged(): AdminOrgaoSocial[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  onTabChange(t: 'active' | 'inactive'): void { this.tab = t; this.currentPage = 1; this.cdr.markForCheck(); }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) { this.currentPage = p; this.cdr.markForCheck(); } }

  secaoLabel(secao: string): string { return secao === 'direcao' ? 'Direção' : 'Conselho Fiscal'; }

  toggleState(m: AdminOrgaoSocial): void {
    const action = m.idState === 1 ? 'desativar' : 'reativar';
    if (!confirm(`Tem a certeza que deseja ${action} este membro?`)) return;
    this.svc.toggleState(m.id).subscribe({
      next: () => {
        m.idState = m.idState === 1 ? 2 : 1;
        this.showToast(m.idState === 2 ? 'Membro desativado.' : 'Membro reativado.', 'success');
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
}
