import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminReportsService } from '../../../services/admin-reports';

@Component({
  selector: 'app-admin-relatorios-add',
  templateUrl: './relatorios-add.html',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRelatoriosAdd {
  titulo = '';
  ano = new Date().getFullYear();
  loading = signal(false);
  error = signal('');

  constructor(private svc: AdminReportsService, private router: Router, private cdr: ChangeDetectorRef) {}

  getSelectedFile(): File | null {
    const input = document.getElementById('docInput') as HTMLInputElement;
    return input?.files?.[0] ?? null;
  }

  submit(): void {
    const file = this.getSelectedFile();
    if (!this.titulo.trim() || !this.ano || !file) {
      this.error.set('Preencha todos os campos e selecione um ficheiro.');
      this.cdr.markForCheck();
      return;
    }
    this.error.set('');
    this.loading.set(true);

    const fd = new FormData();
    fd.append('titulo', this.titulo);
    fd.append('ano', String(this.ano));
    fd.append('idType', '1');
    fd.append('doc', file);

    this.svc.upload(fd).subscribe({
      next: () => this.router.navigate(['/admin/relatorios'], { state: { toast: 'Relatório inserido com sucesso.' } }),
      error: () => {
        this.loading.set(false);
        this.error.set('Erro ao inserir relatório. Tente novamente.');
        this.cdr.markForCheck();
      }
    });
  }
}
