import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NewsService, NewsDetail, NewsItem } from '../../services/news';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-news-detail',
  imports: [RouterLink],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsDetailComponent implements OnInit {
  news: NewsDetail | null = null;
  sidebarNews: NewsItem[] = [];
  loading = true;
  notFound = false;

  readonly uploadsUrl = environment.uploadsUrl + '/';

  constructor(
    private newsService: NewsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loadNews(id);
    });

    this.newsService.getNews(1, 5).subscribe({
      next: (res) => { this.sidebarNews = res.data; this.cdr.markForCheck(); },
    });
  }

  loadNews(id: number): void {
    this.loading = true;
    this.notFound = false;
    this.newsService.getNewsDetail(id).subscribe({
      next: (res) => {
        this.news = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT');
  }

  getImageUrl(url: string): string {
    if (!url) return 'images/cpm.png';
    if (url.startsWith('http')) return url;
    return this.uploadsUrl + url;
  }
}
