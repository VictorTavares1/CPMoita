import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface AdminNewsItem {
  id: number;
  title: string;
  dateHour: string;
  idState: number;
}

export interface AdminNewsDetail {
  id: number;
  title: string;
  content: string;
  dateHour: string;
  idState: number;
  images: { id: number; url: string }[];
}

@Injectable({ providedIn: 'root' })
export class AdminNewsService {
  private readonly api = 'http://localhost/CPMoita/api/admin-news.php';
  private readonly imgApi = 'http://localhost/CPMoita/api/admin-news-image.php';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders(this.auth.getAuthHeaders());
  }

  getAll(): Observable<AdminNewsItem[]> {
    return this.http.get<AdminNewsItem[]>(this.api, { headers: this.headers() });
  }

  getById(id: number): Observable<AdminNewsDetail> {
    return this.http.get<AdminNewsDetail>(`${this.api}?id=${id}`, { headers: this.headers() });
  }

  create(formData: FormData): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, formData, { headers: this.headers() });
  }

  update(id: number, titulo: string, conteudo: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(this.api, { id, titulo, conteudo }, { headers: this.headers() });
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`, { headers: this.headers() });
  }

  uploadImages(newsId: number, files: FileList): Observable<{ success: boolean; images: { id: number; url: string }[] }> {
    const fd = new FormData();
    fd.append('newsId', String(newsId));
    for (let i = 0; i < files.length; i++) fd.append('img[]', files[i]);
    return this.http.post<any>(this.imgApi, fd, { headers: this.headers() });
  }

  deleteImage(imageId: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.imgApi}?id=${imageId}`, { headers: this.headers() });
  }
}
