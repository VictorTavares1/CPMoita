import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminReportItem[]> {
    return this.http.get<AdminReportItem[]>(this.api);
  }

  upload(formData: FormData): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, formData);
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`);
  }
}
