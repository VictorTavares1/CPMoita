import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesListService, Service } from '../../../services/services-list';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ninho',
  imports: [],
  templateUrl: './ninho.html',
  styleUrl: './ninho.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ninho implements OnInit {
  service: Service | null = null;
  currentImages: string[] = [];
  readonly docsUrl = environment.apiUrl + '/docs.php?file=';
  readonly uploadsUrl = environment.uploadsUrl + '/';

  constructor(private servicesListService: ServicesListService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        this.service = list.find(s => s.titulo.toLowerCase().includes('ninho')) ?? null;
        if (!this.service) this.router.navigate(['/']);
        this.cdr.markForCheck();
      },
      error: () => this.router.navigate(['/']),
    });
  }

  selectCor(cor: string): void {
    const cores: Record<string, string[]> = { amarela: ['amarelo'], amarelo: ['amarela'] };
    const aliases = [cor, ...(cores[cor] ?? [])];
    this.currentImages = (this.service?.imagens ?? [])
      .filter(img => aliases.includes(img.titulo.toLowerCase().trim()) && img.filename)
      .map(img => this.uploadsUrl + img.filename);
    this.cdr.markForCheck();
  }
}
