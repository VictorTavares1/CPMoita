import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';
import { PageContentsService, PageContents } from '../../services/page-contents';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-instituicao',
  imports: [RouterLink],
  templateUrl: './instituicao.html',
  styleUrl: './instituicao.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Instituicao implements OnInit {
  contents: PageContents = {};
  sidebarNews: NewsItem[] = [];

  constructor(
    private pageContentsService: PageContentsService,
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.pageContentsService.getContents('sobre_nos').subscribe({
      next: (res) => { this.contents = res; this.cdr.markForCheck(); },
      error: (err) => console.error('Erro ao carregar conteúdos:', err),
    });

    this.newsService.getNews(1, 5).subscribe({
      next: (res) => { this.sidebarNews = res.data; this.cdr.markForCheck(); },
    });
  }

  get(key: string): string {
    return this.contents[key]?.valor ?? '';
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
