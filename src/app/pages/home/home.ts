import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  latestNews: NewsItem[] = [];

  constructor(
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.newsService.getNews(1, 3).subscribe({
      next: (res) => { this.latestNews = res.data; this.cdr.markForCheck(); },
      error: (err) => console.error('Erro ao carregar notícias:', err),
    });
  }

  getImageUrl(url: string | null): string {
    if (!url) return 'images/CPMLogo.png';
    if (url.startsWith('http')) return url;
    return `${environment.uploadsUrl}/${url}`;
  }

  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT');
  }
}
