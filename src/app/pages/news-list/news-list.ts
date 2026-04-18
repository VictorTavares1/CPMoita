import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-news-list',
  imports: [RouterLink],
  templateUrl: './news-list.html',
  styleUrl: './news-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsList implements OnInit, OnDestroy {
  private paramsSub?: Subscription;
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.paramsSub = this.route.queryParams.subscribe(params => {
      const search = params['search'] || '';
      const page = params['page'] ? +params['page'] : 1;

      if (search === this.searchQuery && page === this.currentPage && this.news.length > 0) return;

      this.searchQuery = search;
      this.currentPage = page;

      if (this.searchQuery) {
        this.runSearch();
      } else {
        this.loadNews();
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  loadNews(): void {
    this.loading = true;
    this.isSearching = false;
    this.newsService.getNews(this.currentPage, this.limit).subscribe({
      next: (res) => {
        this.news = res.data;
        this.totalPages = Math.ceil(res.total / this.limit);
        this.updatePages();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); },
    });
  }

  runSearch(): void {
    this.loading = true;
    this.isSearching = true;
    this.newsService.searchNews(this.searchQuery).subscribe({
      next: (res) => {
        this.news = res;
        this.totalPages = 0;
        this.updatePages();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); },
    });
  }

  pages: number[] = [];

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.router.navigate(['/noticias'], { queryParams: { page } });
  }

  private updatePages(): void {
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    this.pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
