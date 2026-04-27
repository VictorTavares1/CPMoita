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

@Injectable({ providedIn: 'root' })
export class AdminLogsService {
  private readonly api = `${environment.apiUrl}/admin-logs.php`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getAll(): Observable<LogItem[]> {
    return this.http.get<LogItem[]>(this.api, {
      headers: new HttpHeaders(this.auth.getAuthHeaders()),
    });
  }
}
