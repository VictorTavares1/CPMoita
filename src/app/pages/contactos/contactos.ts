import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';

@Component({
  selector: 'app-contactos',
  imports: [RouterLink],
  templateUrl: './contactos.html',
  styleUrl: './contactos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contactos implements OnInit {
  sidebarNews: NewsItem[] = [];

  constructor(private newsService: NewsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.newsService.getNews(1, 5).subscribe({
      next: (res) => { this.sidebarNews = res.data; this.cdr.markForCheck(); },
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT');
  }

  getImageUrl(url: string | null): string {
    if (!url) return 'images/cpm.png';
    if (url.startsWith('http')) return url;
    return 'http://localhost/centro-paroquial-moita/uploads/' + url;
  }
}
