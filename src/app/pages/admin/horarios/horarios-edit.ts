import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminHorariosService, HorarioEntrada } from '../../../services/admin-horarios';

@Component({
  selector: 'app-admin-horarios-edit',
  templateUrl: './horarios-edit.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHorariosEdit implements OnInit {
  id = 0;
  nome = '';
  ordem = 0;
  entradas: HorarioEntrada[] = [];
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  constructor(
    private svc: AdminHorariosService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getAll().subscribe({
      next: (list) => {
        const h = list.find(x => x.id === this.id);
        if (h) {
          this.nome    = h.nome;
          this.ordem   = h.ordem;
          this.entradas = h.entradas.map(e => ({ ...e }));
        }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

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
    this.svc.update({ id: this.id, nome: this.nome, entradas, ordem: this.ordem }).subscribe({
      next: () => this.router.navigate(['/admin/horarios'], { state: { toast: 'Horário guardado com sucesso.' } }),
      error: () => { this.error.set('Erro ao guardar. Tente novamente.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
