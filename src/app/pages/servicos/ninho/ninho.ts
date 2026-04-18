import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-ninho',
  imports: [],
  templateUrl: './ninho.html',
  styleUrl: './ninho.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ninho {
  readonly uploadsUrl = 'http://localhost/centro-paroquial-moita/uploads/';

  currentImages: string[] = [];

  private readonly corImagens: Record<string, string[]> = {
    verde: ['sala_ terapia.jpg', 'sala_ terapia.jpg'],
    azul: ['Arcos.jpg', 'Arcos.jpg'],
    amarelo: ['sala_ terapia.jpg'],
    vermelho: ['Arcos.jpg'],
  };

  selectCor(cor: string): void {
    this.currentImages = (this.corImagens[cor] ?? []).map(f => this.uploadsUrl + f);
  }
}
