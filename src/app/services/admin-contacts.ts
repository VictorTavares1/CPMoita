import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminContact[]> {
    return this.http.get<AdminContact[]>(this.api);
  }

  create(data: { tipo: string; valor: string; icone: string }): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, data);
  }

  update(data: { id: number; tipo: string; valor: string; icone: string }): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(this.api, data);
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`);
  }
}
