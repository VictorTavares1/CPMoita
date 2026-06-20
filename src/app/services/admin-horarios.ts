import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HorarioEntrada {
  dia: string;
  horario: string;
}

export interface AdminHorario {
  id: number;
  nome: string;
  entradas: HorarioEntrada[];
  ordem: number;
  idState: number;
}

@Injectable({ providedIn: 'root' })
export class AdminHorariosService {
  private readonly api = `${environment.apiUrl}/admin-horarios.php`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminHorario[]> {
    return this.http.get<AdminHorario[]>(this.api);
  }

  create(data: { nome: string; entradas: HorarioEntrada[]; ordem: number }): Observable<{ success: boolean; id: number }> {
    return this.http.post<{ success: boolean; id: number }>(this.api, data);
  }

  update(data: { id: number; nome: string; entradas: HorarioEntrada[]; ordem: number }): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(this.api, data);
  }

  toggleState(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.api}?id=${id}`);
  }
}
