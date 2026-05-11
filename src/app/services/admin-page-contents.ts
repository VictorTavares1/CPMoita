import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminPageContent[]> {
    return this.http.get<AdminPageContent[]>(this.api);
  }

  update(id: number, conteudoPagina: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(this.api, { id, tipoConteudo: 'html', conteudoPagina });
  }

  updateLink(id: number, label: string, filename: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(this.api, { id, tipoConteudo: 'link', label, filename });
  }

  uploadDoc(file: File): Observable<{ success: boolean; filename: string; name: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; filename: string; name: string }>(
      `${environment.apiUrl}/admin-upload-doc.php`, formData
    );
  }
}
