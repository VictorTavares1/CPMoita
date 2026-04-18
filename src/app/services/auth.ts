import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  email: string;
  expires: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost/CPMoita/api';
  private readonly tokenKey = 'admin_token';
  private readonly emailKey = 'admin_email';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth-login.php`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.emailKey, res.email);
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
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): { Authorization: string } {
    return { Authorization: `Bearer ${this.getToken()}` };
  }
}
