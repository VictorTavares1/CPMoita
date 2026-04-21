import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ServicesListService, Service } from '../../../services/services-list';

@Component({
  selector: 'app-catl',
  imports: [],
  templateUrl: './catl.html',
  styleUrl: './catl.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catl implements OnInit {
  readonly uploadsUrl = 'http://localhost/centro-paroquial-moita/uploads/';
  service: Service | null = null;

  constructor(private servicesListService: ServicesListService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        this.service = list.find(s => s.titulo.toLowerCase().includes('catl')) ?? null;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erro ao carregar serviço:', err),
    });
  }
}
