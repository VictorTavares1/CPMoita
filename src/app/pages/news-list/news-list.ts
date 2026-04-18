import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';

@Component({
  selector: 'app-news-list',
  imports: [RouterLink],
  templateUrl: './news-list.html',
  styleUrl: './news-list.css',
})
export class NewsList implements OnInit {
  news: NewsItem[] = [];
  totalPages = 0;
  currentPage = 1;
  searchQuery = '';
  isSearching = false;
  loading = true;

  readonly limit = 9;
  readonly uploadsUrl = 'http://localhost/centro-paroquial-moita/uploads/';

  constructor(
    private newsService: NewsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.currentPage = params['page'] ? +params['page'] : 1;

      if (this.searchQuery) {
        this.runSearch();
      } else {
        this.loadNews();
      }
    });
  }

  loadNews(): void {
    this.loading = true;
    this.isSearching = false;
    this.newsService.getNews(this.currentPage, this.limit).subscribe({
      next: (res) => {
        this.news = res.data;
        this.totalPages = Math.ceil(res.total / this.limit);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  runSearch(): void {
    this.loading = true;
    this.isSearching = true;
    this.newsService.searchNews(this.searchQuery).subscribe({
      next: (res) => {
        this.news = res;
        this.totalPages = 0;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.router.navigate(['/noticias'], { queryParams: { page } });
  }

  getPages(): number[] {
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT');
  }

  getImageUrl(url: string | null): string {
    if (!url) return 'images/cpm.png';
    if (url.startsWith('http')) return url;
    return this.uploadsUrl + url;
  }
}
