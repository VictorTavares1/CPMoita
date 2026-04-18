import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PageContent {
  tipo: string;
  valor: string;
}

export type PageContents = Record<string, PageContent>;

@Injectable({ providedIn: 'root' })
export class PageContentsService {
  private baseUrl = 'http://localhost/CPMoita/api/page-contents.php';

  constructor(private http: HttpClient) {}

  getContents(pagina: string): Observable<PageContents> {
    return this.http.get<PageContents>(`${this.baseUrl}?pagina=${encodeURIComponent(pagina)}`);
  }
}
