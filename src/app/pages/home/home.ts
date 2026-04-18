import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  latestNews: NewsItem[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getNews(1, 3).subscribe({
      next: (res) => (this.latestNews = res.data),
      error: (err) => console.error('Erro ao carregar notícias:', err),
    });
  }

  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT');
  }
}
