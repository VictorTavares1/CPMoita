import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

export interface AdminService {
  id: number;
  titulo: string;
  descricao: string;
  iconeOuImagem: string;
  idState: number;
}

@Injectable({ providedIn: 'root' })
export class AdminServicesService {
  private readonly api = `${environment.apiUrl}/admin-services.php`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders(this.auth.getAuthHeaders());
  }

  getAll(): Observable<AdminService[]> {
    return this.http.get<AdminService[]>(this.api, { headers: this.headers() });
  }

  create(data: { titulo: string; descricao: string; iconeOuImagem: string }): Observable<{ success: boolean; id: number }> {
    return this.http.post<any>(this.api, data, { headers: this.headers() });
  }

  update(data: { id: number; titulo: string; descricao: string; iconeOuImagem: string }): Observable<{ success: boolean }> {
    return this.http.put<any>(this.api, data, { headers: this.headers() });
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<any>(`${this.api}?id=${id}`, { headers: this.headers() });
  }
}
