import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

export interface AdminContact {
  id: number;
  tipo: string;
  valor: string;
  icone: string;
  idState: number;
}

@Injectable({ providedIn: 'root' })
export class AdminContactsService {
  private readonly api = `${environment.apiUrl}/admin-contacts.php`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders(this.auth.getAuthHeaders());
  }

  getAll(): Observable<AdminContact[]> {
    return this.http.get<AdminContact[]>(this.api, { headers: this.headers() });
  }

  create(data: { tipo: string; valor: string; icone: string }): Observable<{ success: boolean; id: number }> {
    return this.http.post<any>(this.api, data, { headers: this.headers() });
  }

  update(data: { id: number; tipo: string; valor: string; icone: string }): Observable<{ success: boolean }> {
    return this.http.put<any>(this.api, data, { headers: this.headers() });
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<any>(`${this.api}?id=${id}`, { headers: this.headers() });
  }
}
