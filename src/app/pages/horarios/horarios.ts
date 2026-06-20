import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NewsService, NewsItem } from '../../services/news';
import { environment } from '../../../environments/environment';

interface HorarioEntrada { dia: string; horario: string; }
interface Horario { id: number; nome: string; entradas: HorarioEntrada[]; }

@Component({
  selector: 'app-horarios',
  imports: [RouterLink],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Horarios implements OnInit {
  sidebarNews: NewsItem[] = [];
  horarios: Horario[] = [];
  selectedId: number | null = null;
  showTable = true;

  get currentHorario(): Horario | null {
    return this.horarios.find(h => h.id === this.selectedId) ?? null;
  }

  constructor(private http: HttpClient, private newsService: NewsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get<Horario[]>(`${environment.apiUrl}/horarios.php`).subscribe({
      next: (data) => {
        this.horarios = data;
        if (data.length > 0) this.selectedId = data[0].id;
        this.cdr.markForCheck();
      },
    });

    this.newsService.getNews(1, 5).subscribe({
      next: (res) => { this.sidebarNews = res.data; this.cdr.markForCheck(); },
    });
  }

  onSetorChange(event: Event): void {
    this.selectedId = Number((event.target as HTMLSelectElement).value);
    this.showTable = false;
    this.cdr.markForCheck();
    setTimeout(() => { this.showTable = true; this.cdr.markForCheck(); }, 10);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT');
  }

  getImageUrl(url: string | null): string {
    if (!url) return '/images/cpm.png';
    if (url.startsWith('http')) return url;
    return `${environment.uploadsUrl}/${url}`;
  }
}
