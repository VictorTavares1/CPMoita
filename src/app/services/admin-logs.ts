import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

export interface LogItem {
  id: number;
  dateHour: string;
  userEmail: string;
  operation: string;
  name: string;
}

export interface LogsPage {
  data: LogItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class AdminLogsService {
  private readonly api = `${environment.apiUrl}/admin-logs.php`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getPage(page: number, limit: number = 50): Observable<LogsPage> {
    return this.http.get<LogsPage>(`${this.api}?page=${page}&limit=${limit}`, {
      headers: new HttpHeaders(this.auth.getAuthHeaders()),
    });
  }
}
