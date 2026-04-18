import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NewsService, NewsDetail, NewsItem } from '../../services/news';

@Component({
  selector: 'app-news-detail',
  imports: [RouterLink],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.css',
})
export class NewsDetailComponent implements OnInit {
  news: NewsDetail | null = null;
  sidebarNews: NewsItem[] = [];
  loading = true;
  notFound = false;

  readonly uploadsUrl = 'http://localhost/centro-paroquial-moita/uploads/';

  constructor(
    private newsService: NewsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loadNews(id);
    });

    this.newsService.getNews(1, 5).subscribe({
      next: (res) => (this.sidebarNews = res.data),
    });
  }

  loadNews(id: number): void {
    this.loading = true;
    this.notFound = false;
    this.newsService.getNewsDetail(id).subscribe({
      next: (res) => {
        this.news = res;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
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
