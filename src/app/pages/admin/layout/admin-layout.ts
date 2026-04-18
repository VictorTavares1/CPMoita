import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css'],
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  constructor(public auth: AuthService) {}

  logout(): void {
    this.auth.logout();
  }
}
