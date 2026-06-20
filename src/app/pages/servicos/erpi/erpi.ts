import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesListService, Service } from '../../../services/services-list';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-erpi',
  imports: [],
  templateUrl: './erpi.html',
  styleUrl: './erpi.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Erpi implements OnInit {
  readonly docsUrl    = environment.apiUrl + '/docs.php?file=';
  readonly uploadsUrl = environment.uploadsUrl + '/';
  service: Service | null = null;

  constructor(private servicesListService: ServicesListService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        this.service = list.find(s => s.titulo.toLowerCase().includes('erpi')) ?? null;
        if (!this.service) this.router.navigate(['/']);
        this.cdr.markForCheck();
      },
      error: () => this.router.navigate(['/']),
    });
  }
}
