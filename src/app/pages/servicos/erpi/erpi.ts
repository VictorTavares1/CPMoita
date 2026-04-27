import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesListService } from '../../../services/services-list';

@Component({
  selector: 'app-erpi',
  imports: [],
  templateUrl: './erpi.html',
  styleUrl: './erpi.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Erpi implements OnInit {
  readonly downloadBase = '/docs/';

  constructor(private servicesListService: ServicesListService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicesListService.getServices().subscribe({
      next: (list) => {
        const s = list.find(s => s.titulo.toLowerCase().includes('erpi'));
        if (!s) this.router.navigate(['/']);
      },
      error: () => this.router.navigate(['/']),
    });
  }
}
