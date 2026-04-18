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

export interface NewsResponse {
  data: NewsItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiUrl = 'http://localhost/CPMoita/api/news.php';

  constructor(private http: HttpClient) {}

  getNews(page: number = 1, limit: number = 9): Observable<NewsResponse> {
    return this.http.get<NewsResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }
}
