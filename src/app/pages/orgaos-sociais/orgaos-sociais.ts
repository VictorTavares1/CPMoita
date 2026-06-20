import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NewsService, NewsItem } from '../../services/news';
import { environment } from '../../../environments/environment';

interface OrgaoSocial {
  id: number;
  cargo: string;
  secao: 'direcao' | 'conselho_fiscal';
  nome: string;
}

@Component({
  selector: 'app-orgaos-sociais',
  imports: [RouterLink],
  templateUrl: './orgaos-sociais.html',
  styleUrl: './orgaos-sociais.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgaosSociais implements OnInit {
  sidebarNews: NewsItem[] = [];
  direcao: OrgaoSocial[] = [];
  conselhoFiscal: OrgaoSocial[] = [];

  constructor(
    private newsService: NewsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.newsService.getNews(1, 5).subscribe({
      next: (res) => { this.sidebarNews = res.data; this.cdr.markForCheck(); },
    });

    this.http.get<OrgaoSocial[]>(`${environment.apiUrl}/orgaos-sociais.php`).subscribe({
      next: (data) => {
        this.direcao = data.filter(m => m.secao === 'direcao');
        this.conselhoFiscal = data.filter(m => m.secao === 'conselho_fiscal');
        this.cdr.markForCheck();
      },
    });
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
