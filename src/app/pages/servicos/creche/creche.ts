import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesListService, Service } from '../../../services/services-list';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-creche',
  imports: [],
  templateUrl: './creche.html',
  styleUrl: './creche.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Creche implements OnInit {
  readonly uploadsUrl = environment.uploadsUrl + '/';
  service: Service | null = null;

  constructor(private servicesListService: ServicesListService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        this.service = list.find(s => s.titulo.toLowerCase().includes('regaço')) ?? null;
        if (!this.service) this.router.navigate(['/']);
        this.cdr.markForCheck();
      },
      error: () => this.router.navigate(['/']),
    });
  }
}
