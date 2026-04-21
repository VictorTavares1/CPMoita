import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ServicesListService, Service } from '../../../services/services-list';

@Component({
  selector: 'app-ninho',
  imports: [],
  templateUrl: './ninho.html',
  styleUrl: './ninho.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ninho implements OnInit {
  readonly uploadsUrl = 'http://localhost/centro-paroquial-moita/uploads/';
  service: Service | null = null;
  currentImages: string[] = [];

  private readonly corImagens: Record<string, string[]> = {
    verde: ['sala_ terapia.jpg', 'sala_ terapia.jpg'],
    azul: ['Arcos.jpg', 'Arcos.jpg'],
    amarelo: ['sala_ terapia.jpg'],
    vermelho: ['Arcos.jpg'],
  };

  constructor(private servicesListService: ServicesListService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        this.service = list.find(s => s.titulo.toLowerCase().includes('ninho')) ?? null;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Erro ao carregar serviço:', err),
    });
  }

  selectCor(cor: string): void {
    this.currentImages = (this.corImagens[cor] ?? []).map(f => this.uploadsUrl + f);
    this.cdr.markForCheck();
  }
}
