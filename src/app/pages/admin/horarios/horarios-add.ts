import { Component, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminHorariosService, HorarioEntrada } from '../../../services/admin-horarios';

@Component({
  selector: 'app-admin-horarios-add',
  templateUrl: './horarios-add.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHorariosAdd {
  nome = '';
  ordem = 0;
  entradas: HorarioEntrada[] = [{ dia: '', horario: '' }];
  saving = signal(false);
  error = signal('');

  constructor(private svc: AdminHorariosService, private router: Router, private cdr: ChangeDetectorRef) {}

  addEntrada(): void {
    this.entradas = [...this.entradas, { dia: '', horario: '' }];
    this.cdr.markForCheck();
  }

  removeEntrada(index: number): void {
    this.entradas = this.entradas.filter((_, i) => i !== index);
    this.cdr.markForCheck();
  }

  updateEntrada(index: number, field: keyof HorarioEntrada, value: string): void {
    this.entradas = this.entradas.map((e, i) => i === index ? { ...e, [field]: value } : e);
  }

  trackByIndex(index: number): number { return index; }

  save(): void {
    if (!this.nome.trim()) {
      this.error.set('O nome do setor é obrigatório.');
      this.cdr.markForCheck();
      return;
    }
    const entradas = this.entradas.filter(e => e.dia.trim() && e.horario.trim());
    this.error.set('');
    this.saving.set(true);
    this.svc.create({ nome: this.nome, entradas, ordem: this.ordem }).subscribe({
      next: () => this.router.navigate(['/admin/horarios'], { state: { toast: 'Horário criado com sucesso.' } }),
      error: () => { this.error.set('Erro ao criar. Tente novamente.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
