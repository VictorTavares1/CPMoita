import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesListService } from '../../../services/services-list';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-catl',
  imports: [],
  templateUrl: './catl.html',
  styleUrl: './catl.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catl implements OnInit {
  readonly uploadsUrl = environment.uploadsUrl + '/';

  constructor(private servicesListService: ServicesListService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        const s = list.find(s => s.titulo.toLowerCase().includes('catl') || s.titulo.toLowerCase().includes('barco'));
        if (!s) this.router.navigate(['/']);
      },
      error: () => this.router.navigate(['/']),
    });
  }
}
