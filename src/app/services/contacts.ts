import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contact {
  id: number;
  tipo: string;
  valor: string;
  icone: string;
}

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private readonly apiUrl = `${environment.apiUrl}/contacts.php`;

  constructor(private http: HttpClient) {}

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }
}
