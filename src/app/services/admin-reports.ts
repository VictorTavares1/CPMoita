import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

export interface AdminReportItem {
  id: number;
  title: string;
  url: string;
  year: number | null;
  idType: number;
  idState: number;
}

@Injectable({ providedIn: 'root' })
export class AdminReportsService {
  private readonly api = `${environment.apiUrl}/admin-reports.php`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders(this.auth.getAuthHeaders());
  }

  getAll(): Observable<AdminReportItem[]> {
    return this.http.get<AdminReportItem[]>(this.api, { headers: this.headers() });
  }

  upload(formData: FormData): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, formData, { headers: this.headers() });
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`, { headers: this.headers() });
  }
}
