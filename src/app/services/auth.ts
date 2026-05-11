import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  email: string;
  expires: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  // Apenas metadados no localStorage — o token está no cookie HttpOnly e nunca toca no JS
  private readonly emailKey   = 'admin_email';
  private readonly expiresKey = 'admin_expires';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth-login.php`,
      { email, password },
      { withCredentials: true }   // browser envia e guarda o cookie HttpOnly
    ).pipe(
      tap(res => {
        localStorage.setItem(this.emailKey,   res.email);
        localStorage.setItem(this.expiresKey, res.expires);
      })
    );
  }

  logout(): void {
    this.http.post(
      `${this.apiUrl}/auth-logout.php`,
      {},
      { withCredentials: true }   // envia o cookie para o PHP o apagar da BD
    ).subscribe();
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.expiresKey);
    this.router.navigate(['/admin/login']);
  }

  getEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  isLoggedIn(): boolean {
    const expires = localStorage.getItem(this.expiresKey);
    if (!expires) return false;
    return new Date(expires) > new Date();
  }
}
