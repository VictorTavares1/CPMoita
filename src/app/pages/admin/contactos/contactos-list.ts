import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminContactsService, AdminContact } from '../../../services/admin-contacts';

@Component({
  selector: 'app-admin-contactos',
  templateUrl: './contactos-list.html',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContactos implements OnInit {
  contacts: AdminContact[] = [];
  loading = signal(true);
  toast = signal('');
  toastType = signal('success');
  tab: 'active' | 'inactive' = 'active';

  get activeContacts(): AdminContact[] { return this.contacts.filter(c => c.idState === 1); }
  get inactiveContacts(): AdminContact[] { return this.contacts.filter(c => c.idState === 2); }
  get filtered(): AdminContact[] { return this.tab === 'active' ? this.activeContacts : this.inactiveContacts; }

  constructor(private svc: AdminContactsService, public cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.contacts = data; this.loading.set(false); this.cdr.markForCheck(); },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  toggleState(c: AdminContact): void {
    const action = c.idState === 1 ? 'desativar' : 'reativar';
    if (!confirm(`Tem a certeza que deseja ${action} este contacto?`)) return;
    this.svc.toggleState(c.id).subscribe({
      next: () => {
        c.idState = c.idState === 1 ? 2 : 1;
        this.showToast(c.idState === 2 ? 'Contacto desativado.' : 'Contacto reativado.', 'success');
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
