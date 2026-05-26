import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth';
import { environment } from '../../../../environments/environment';

interface DashboardStats {
  news: number;
  reports: number;
  services: number;
  contacts: number;
}

interface RecentNews {
  id: number;
  title: string;
  dateHour: string;
  idState: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.html',
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard implements OnInit {
  stats = signal<DashboardStats | null>(null);
  recentNews = signal<RecentNews[]>([]);
  loading = signal(true);

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ stats: DashboardStats; recentNews: RecentNews[] }>(
      `${environment.apiUrl}/admin-dashboard.php`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.stats.set(data.stats);
        this.recentNews.set(data.recentNews);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
