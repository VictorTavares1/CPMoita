import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PageContent {
  tipo: string;
  valor: string;
}

export type PageContents = Record<string, PageContent>;

@Injectable({ providedIn: 'root' })
export class PageContentsService {
  private readonly apiUrl = `${environment.apiUrl}/page-contents.php`;

  constructor(private http: HttpClient) {}

  getContents(pagina: string): Observable<PageContents> {
    return this.http.get<PageContents>(`${this.apiUrl}?pagina=${encodeURIComponent(pagina)}`);
  }
}
