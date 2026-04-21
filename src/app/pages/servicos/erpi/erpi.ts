import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ServicesListService, Service } from '../../../services/services-list';

@Component({
  selector: 'app-erpi',
  imports: [],
  templateUrl: './erpi.html',
  styleUrl: './erpi.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Erpi implements OnInit {
  readonly downloadBase = 'http://localhost/centro-paroquial-moita/db/download.php?file=';
  service: Service | null = null;

  constructor(private servicesListService: ServicesListService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        this.service = list.find(s => s.titulo.toLowerCase().includes('erpi')) ?? null;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erro ao carregar serviço:', err),
    });
  }
}
