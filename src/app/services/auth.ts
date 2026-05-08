import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  email: string;
  expires: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey   = 'admin_token';
  private readonly emailKey   = 'admin_email';
  private readonly expiresKey = 'admin_expires';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth-login.php`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey,   res.token);
        localStorage.setItem(this.emailKey,   res.email);
        localStorage.setItem(this.expiresKey, res.expires);
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/auth-logout.php`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe();
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.expiresKey);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  isLoggedIn(): boolean {
    const token   = this.getToken();
    const expires = localStorage.getItem(this.expiresKey);
    if (!token || !expires) return false;
    return new Date(expires) > new Date();
  }

  getAuthHeaders(): { Authorization: string } {
    return { Authorization: `Bearer ${this.getToken()}` };
  }
}
