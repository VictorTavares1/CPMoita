import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminOrgaoSocial {
  id: number;
  cargo: string;
  secao: 'direcao' | 'conselho_fiscal';
  nome: string;
  idState: number;
}

@Injectable({ providedIn: 'root' })
export class AdminOrgaosSociaisService {
  private readonly api = `${environment.apiUrl}/admin-orgaos-sociais.php`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminOrgaoSocial[]> {
    return this.http.get<AdminOrgaoSocial[]>(this.api);
  }

  create(data: { cargo: string; secao: string; nome: string }): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, data);
  }

  update(data: { id: number; cargo: string; secao: string; nome: string }): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(this.api, data);
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`);
  }
}
