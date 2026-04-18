import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-catl',
  imports: [],
  templateUrl: './catl.html',
  styleUrl: './catl.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catl {
  readonly uploadsUrl = 'http://localhost/centro-paroquial-moita/uploads/';
}
