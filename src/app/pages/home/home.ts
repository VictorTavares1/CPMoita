import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';
import { PageContentsService, PageContents } from '../../services/page-contents';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  latestNews: NewsItem[] = [];
  contents: PageContents = {};

  constructor(
    private newsService: NewsService,
    private pageContentsService: PageContentsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.newsService.getNews(1, 3).subscribe({
      next: (res) => { this.latestNews = res.data; this.cdr.markForCheck(); },
      error: (err) => console.error('Erro ao carregar notícias:', err),
    });

    this.pageContentsService.getContents('inicio').subscribe({
      next: (res) => { this.contents = res; this.cdr.markForCheck(); },
      error: (err) => console.error('Erro ao carregar conteúdos:', err),
    });
  }

  get(key: string): string {
    return this.contents[key]?.valor ?? '';
  }

  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT');
  }
}
