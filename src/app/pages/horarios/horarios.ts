import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';
import { environment } from '../../../environments/environment';

interface HorarioEntry { dia: string; horario: string; }
interface Setor { nome: string; horarios: HorarioEntry[]; }

@Component({
  selector: 'app-horarios',
  imports: [RouterLink],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Horarios implements OnInit {
  sidebarNews: NewsItem[] = [];
  selectedSetor = 'secretaria';

  readonly setores: Record<string, Setor> = {
    secretaria: {
      nome: 'Secretaria',
      horarios: [
        { dia: 'Segunda-feira', horario: '10:00 - 12:00' },
        { dia: 'Terça-feira', horario: '08:00 - 18:00' },
        { dia: 'Quarta-feira', horario: '08:00 - 18:00' },
        { dia: 'Quinta-feira', horario: '08:00 - 18:00' },
        { dia: 'Sexta-feira', horario: '08:00 - 18:00' },
      ]
    },
    ninho: {
      nome: 'Ninho',
      horarios: [
        { dia: 'Segunda-feira', horario: '09:00 - 17:00' },
        { dia: 'Terça-feira', horario: '09:00 - 17:00' },
        { dia: 'Quarta-feira', horario: '09:00 - 17:00' },
        { dia: 'Quinta-feira', horario: '09:00 - 17:00' },
        { dia: 'Sexta-feira', horario: '09:00 - 17:00' },
      ]
    },
    coordenadora: {
      nome: 'Atendimento da Coordenadora Pedagógica',
      horarios: [
        { dia: 'Segunda-feira', horario: '17:00 - 18:30' },
        { dia: 'Quinta-feira', horario: '17:00 - 18:30' },
      ]
    },
    educadoras: {
      nome: 'Atendimento das Educadoras aos Encarregados de Educação',
      horarios: [
        { dia: 'Segunda-feira', horario: '17:00 - 18:30' },
        { dia: 'Terça-feira', horario: '16:00 - 17:30' },
        { dia: 'Quarta-feira', horario: '17:00 - 18:30' },
        { dia: 'Quinta-feira', horario: '17:00 - 18:30' },
        { dia: 'Sexta-feira', horario: '16:00 - 17:30' },
      ]
    },
  };

  currentHorarios: HorarioEntry[] = this.setores['secretaria'].horarios;
  showTable = true;

  constructor(private newsService: NewsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.newsService.getNews(1, 5).subscribe({
      next: (res) => { this.sidebarNews = res.data; this.cdr.markForCheck(); },
    });
  }

  onSetorChange(event: Event): void {
    this.selectedSetor = (event.target as HTMLSelectElement).value;
    this.showTable = false;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.currentHorarios = this.setores[this.selectedSetor]?.horarios ?? [];
      this.showTable = true;
      this.cdr.markForCheck();
    }, 10);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT');
  }

  getImageUrl(url: string | null): string {
    if (!url) return 'images/cpm.png';
    if (url.startsWith('http')) return url;
    return `${environment.uploadsUrl}/${url}`;
  }
}
