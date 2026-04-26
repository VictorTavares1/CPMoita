import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-erpi',
  imports: [],
  templateUrl: './erpi.html',
  styleUrl: './erpi.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Erpi {
  readonly downloadBase = '/CPMoita/docs/';
}
