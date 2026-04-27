import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { ServicesListService, Service } from '../../services/services-list';

const ROUTE_MAP: Record<string, string> = {
  'regaço': '/servicos/creche',
  'ninho':  '/servicos/ninho',
  'catl':   '/servicos/catl',
  'barco':  '/servicos/catl',
  'erpi':   '/servicos/erpi',
};

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  activeServices: (Service & { route: string })[] = [];

  constructor(private router: Router, private servicesListService: ServicesListService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        this.activeServices = list.map(s => ({
          ...s,
          route: Object.entries(ROUTE_MAP).find(([key]) => s.titulo.toLowerCase().includes(key))?.[1] ?? '/'
        }));
        this.cdr.markForCheck();
      },
    });
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/noticias'], { queryParams: { search: query.trim() } });
    }
  }
}
