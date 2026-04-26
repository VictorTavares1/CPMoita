import { Component, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-catl',
  imports: [],
  templateUrl: './catl.html',
  styleUrl: './catl.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catl {
  readonly uploadsUrl = environment.uploadsUrl + '/';
}
