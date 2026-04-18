import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';
import { PageContentsService, PageContents } from '../../services/page-contents';

@Component({
  selector: 'app-instituicao',
  imports: [CommonModule, RouterLink],
  templateUrl: './instituicao.html',
  styleUrl: './instituicao.css',
})
export class Instituicao implements OnInit {
  contents: PageContents = {};
  sidebarNews: NewsItem[] = [];

  constructor(
    private pageContentsService: PageContentsService,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.pageContentsService.getContents('sobre_nos').subscribe({
      next: (res) => (this.contents = res),
      error: (err) => console.error('Erro ao carregar conteúdos:', err),
    });

    this.newsService.getNews(1, 5).subscribe({
      next: (res) => (this.sidebarNews = res.data),
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
    return 'http://localhost/centro-paroquial-moita/uploads/' + url;
  }
}
