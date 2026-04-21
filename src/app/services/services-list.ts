import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Service {
  id: number;
  titulo: string;
  descricao: string;
  iconeOuImagem: string;
}

@Injectable({ providedIn: 'root' })
export class ServicesListService {
  private apiUrl = 'http://localhost/CPMoita/api/services.php';

  constructor(private http: HttpClient) {}

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }
}
