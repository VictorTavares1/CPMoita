import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

export interface AdminPageContent {
  id: number;
  nomePagina: string;
  'chaveSecção': string;
  tipoConteudo: string;
  conteudoPagina: string;
  atualizadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class AdminPageContentsService {
  private readonly api = `${environment.apiUrl}/admin-page-contents.php`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders(this.auth.getAuthHeaders());
  }

  getAll(): Observable<AdminPageContent[]> {
    return this.http.get<AdminPageContent[]>(this.api, { headers: this.headers() });
  }

  update(id: number, conteudoPagina: string): Observable<{ success: boolean }> {
    return this.http.put<any>(this.api, { id, conteudoPagina }, { headers: this.headers() });
  }
}
