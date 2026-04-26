import { Component, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  scrolled = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const next = window.scrollY > 10;
    if (next !== this.scrolled) {
      this.scrolled = next;
      this.cdr.markForCheck();
    }
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/noticias'], { queryParams: { search: query.trim() } });
    }
  }
}
