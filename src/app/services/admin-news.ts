import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

export interface AdminNewsPage {
  data: AdminNewsItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class AdminNewsService {
  private readonly api = `${environment.apiUrl}/admin-news.php`;
  private readonly imgApi = `${environment.apiUrl}/admin-news-image.php`;

  constructor(private http: HttpClient) {}

  getPage(page: number, limit: number, search = '', state?: number): Observable<AdminNewsPage> {
    let url = `${this.api}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (state !== undefined) url += `&state=${state}`;
    return this.http.get<AdminNewsPage>(url);
  }

  getById(id: number): Observable<AdminNewsDetail> {
    return this.http.get<AdminNewsDetail>(`${this.api}?id=${id}`);
  }

  create(formData: FormData): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, formData);
  }

  update(id: number, titulo: string, conteudo: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(this.api, { id, titulo, conteudo });
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`);
  }

  uploadImages(newsId: number, files: FileList): Observable<{ success: boolean; images: { id: number; url: string }[] }> {
    const fd = new FormData();
    fd.append('newsId', String(newsId));
    for (let i = 0; i < files.length; i++) fd.append('img[]', files[i]);
    return this.http.post<{ success: boolean; images: { id: number; url: string }[] }>(this.imgApi, fd);
  }

  deleteImage(imageId: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.imgApi}?id=${imageId}`);
  }
}
