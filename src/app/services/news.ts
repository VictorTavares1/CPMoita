import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  dateHour: string;
  url: string | null;
}

export interface NewsDetail {
  id: number;
  title: string;
  content: string;
  dateHour: string;
  images: string[];
}

export interface NewsResponse {
  data: NewsItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private baseUrl = 'http://localhost/CPMoita/api';

  constructor(private http: HttpClient) {}

  getNews(page: number = 1, limit: number = 9): Observable<NewsResponse> {
    return this.http.get<NewsResponse>(`${this.baseUrl}/news.php?page=${page}&limit=${limit}`);
  }

  getNewsDetail(id: number): Observable<NewsDetail> {
    return this.http.get<NewsDetail>(`${this.baseUrl}/news-detail.php?id=${id}`);
  }

  searchNews(query: string): Observable<NewsItem[]> {
    return this.http.get<NewsItem[]>(`${this.baseUrl}/news-search.php?q=${encodeURIComponent(query)}`);
  }
}
