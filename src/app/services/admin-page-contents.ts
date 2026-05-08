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
    return this.http.put<any>(this.api, { id, tipoConteudo: 'html', conteudoPagina }, { headers: this.headers() });
  }

  updateLink(id: number, label: string, filename: string): Observable<{ success: boolean }> {
    return this.http.put<any>(this.api, { id, tipoConteudo: 'link', label, filename }, { headers: this.headers() });
  }

  uploadDoc(file: File): Observable<{ success: boolean; filename: string; name: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${environment.apiUrl}/admin-upload-doc.php`, formData, { headers: new HttpHeaders(this.auth.getAuthHeaders()) });
  }
}
