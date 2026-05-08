import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';
import { PageContentsService, PageContents, PageLink } from '../../services/page-contents';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-instituicao',
  imports: [RouterLink],
  templateUrl: './instituicao.html',
  styleUrl: './instituicao.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Instituicao implements OnInit {
  sidebarNews: NewsItem[] = [];
  page: PageContents = {};
  links: PageLink[] = [];
  docsUrl = environment.apiUrl + '/docs.php?file=';

  constructor(
    private newsService: NewsService,
    private pageContentsService: PageContentsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.newsService.getNews(1, 5).subscribe({
      next: (res) => { this.sidebarNews = res.data; this.cdr.markForCheck(); },
    });

    this.pageContentsService.getContents('sobre_nos').subscribe({
      next: (data) => {
        this.page = data;
        this.links = Object.values(data)
          .filter(c => c.tipo === 'link' && typeof c.valor === 'object')
          .map(c => c.valor as PageLink);
        this.cdr.markForCheck();
      },
    });
  }

  get(key: string): string {
    const v = this.page[key]?.valor;
    return typeof v === 'string' ? v : '';
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
