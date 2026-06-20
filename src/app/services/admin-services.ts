import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServiceLink, ServiceImagem } from './services-list';

export interface AdminService {
  id: number;
  titulo: string;
  descricao: string;
  coordenador: string | null;
  capacidade: string | null;
  funcionamento: string | null;
  servicosPrestados: string[];
  descricaoCentroDia: string | null;
  links: ServiceLink[];
  imagens: ServiceImagem[];
  iconeOuImagem: string;
  idState: number;
}

@Injectable({ providedIn: 'root' })
export class AdminServicesService {
  private readonly api = `${environment.apiUrl}/admin-services.php`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminService[]> {
    return this.http.get<AdminService[]>(this.api);
  }

  create(data: { titulo: string; descricao: string; iconeOuImagem: string }): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, data);
  }

  update(data: { id: number; titulo: string; descricao: string; coordenador: string | null; capacidade: string | null; funcionamento: string | null; servicosPrestados: string[]; descricaoCentroDia: string | null; links: ServiceLink[]; imagens: ServiceImagem[]; iconeOuImagem: string }): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(this.api, data);
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`);
  }

  uploadDoc(file: File): Observable<{ success: boolean; filename: string; name: string }> {
    const form = new FormData();
    form.append('doc', file);
    return this.http.post<{ success: boolean; filename: string; name: string }>(
      `${environment.apiUrl}/admin-upload-doc.php`, form
    );
  }

  uploadImage(file: File): Observable<{ success: boolean; filename: string }> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ success: boolean; filename: string }>(
      `${environment.apiUrl}/admin-upload-image.php`, form
    );
  }
}
