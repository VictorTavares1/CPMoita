import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesListService } from '../../../services/services-list';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ninho',
  imports: [],
  templateUrl: './ninho.html',
  styleUrl: './ninho.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ninho implements OnInit {
  currentImages: string[] = [];

  private readonly uploadsUrl = environment.uploadsUrl + '/';

  private readonly corImagens: Record<string, string[]> = {
    verde: ['sala_ terapia.jpg', 'sala_ terapia.jpg'],
    azul: ['Arcos.jpg', 'Arcos.jpg'],
    amarelo: ['sala_ terapia.jpg'],
    vermelho: ['Arcos.jpg'],
  };

  constructor(private servicesListService: ServicesListService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        const s = list.find(s => s.titulo.toLowerCase().includes('ninho'));
        if (!s) this.router.navigate(['/']);
      },
      error: () => this.router.navigate(['/']),
    });
  }

  selectCor(cor: string): void {
    this.currentImages = (this.corImagens[cor] ?? []).map(f => this.uploadsUrl + f);
    this.cdr.markForCheck();
  }
}
