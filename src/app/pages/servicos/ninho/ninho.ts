import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ninho',
  imports: [],
  templateUrl: './ninho.html',
  styleUrl: './ninho.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ninho {
  currentImages: string[] = [];

  private readonly uploadsUrl = environment.uploadsUrl + '/';

  private readonly corImagens: Record<string, string[]> = {
    verde: ['sala_ terapia.jpg', 'sala_ terapia.jpg'],
    azul: ['Arcos.jpg', 'Arcos.jpg'],
    amarelo: ['sala_ terapia.jpg'],
    vermelho: ['Arcos.jpg'],
  };

  constructor(private cdr: ChangeDetectorRef) {}

  selectCor(cor: string): void {
    this.currentImages = (this.corImagens[cor] ?? []).map(f => this.uploadsUrl + f);
    this.cdr.markForCheck();
  }
}
