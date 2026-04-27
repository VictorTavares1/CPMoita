import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

export interface AdminItem {
  id: number;
  email: string;
  idState: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAdminsService {
  private readonly api = `${environment.apiUrl}/admin-admins.php`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders(this.auth.getAuthHeaders());
  }

  getAll(): Observable<AdminItem[]> {
    return this.http.get<AdminItem[]>(this.api, { headers: this.headers() });
  }

  add(email: string, password: string): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, { email, password }, { headers: this.headers() });
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`, { headers: this.headers() });
  }
}
