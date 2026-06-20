import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminHorariosService, AdminHorario } from '../../../services/admin-horarios';

@Component({
  selector: 'app-admin-horarios',
  templateUrl: './horarios-list.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHorarios implements OnInit {
  horarios: AdminHorario[] = [];
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');
  tab: 'active' | 'inactive' = 'active';

  get activeHorarios(): AdminHorario[] { return this.horarios.filter(h => h.idState === 1); }
  get inactiveHorarios(): AdminHorario[] { return this.horarios.filter(h => h.idState === 2); }
  get filtered(): AdminHorario[] { return this.tab === 'active' ? this.activeHorarios : this.inactiveHorarios; }

  constructor(private svc: AdminHorariosService, public cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.horarios = data; this.loading.set(false); this.cdr.markForCheck(); },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  toggleState(h: AdminHorario): void {
    const action = h.idState === 1 ? 'desativar' : 'reativar';
    if (!confirm(`Tem a certeza que deseja ${action} este horário?`)) return;
    this.svc.toggleState(h.id).subscribe({
      next: () => {
        h.idState = h.idState === 1 ? 2 : 1;
        this.showToast(h.idState === 2 ? 'Horário desativado.' : 'Horário reativado.', 'success');
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
