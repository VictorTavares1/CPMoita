import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminServicesService, AdminService } from '../../../services/admin-services';

@Component({
  selector: 'app-admin-servicos',
  templateUrl: './servicos-list.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServicos implements OnInit {
  services: AdminService[] = [];
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');

  constructor(private svc: AdminServicesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.services = data; this.loading.set(false); this.cdr.markForCheck(); },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  toggleState(s: AdminService): void {
    const action = s.idState === 1 ? 'desativar' : 'reativar';
    if (!confirm(`Tem a certeza que deseja ${action} este serviço?`)) return;
    this.svc.toggleState(s.id).subscribe({
      next: () => {
        s.idState = s.idState === 1 ? 2 : 1;
        this.showToast(s.idState === 2 ? 'Serviço desativado.' : 'Serviço reativado.', 'success');
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
