import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminItem {
  id: number;
  email: string;
  idState: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAdminsService {
  private readonly api = `${environment.apiUrl}/admin-admins.php`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminItem[]> {
    return this.http.get<AdminItem[]>(this.api);
  }

  add(email: string, password: string): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, { email, password });
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`);
  }
}
