import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-creche',
  imports: [],
  templateUrl: './creche.html',
  styleUrl: './creche.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Creche {
  readonly uploadsUrl = 'http://localhost/centro-paroquial-moita/uploads/';
}
