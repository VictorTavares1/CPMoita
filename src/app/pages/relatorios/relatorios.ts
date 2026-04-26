import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-relatorios',
  imports: [],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Relatorios implements OnInit {
  years: number[] = [];
  readonly downloadBase = `${environment.apiUrl}/reports-download.php?year=`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get<number[]>(`${environment.apiUrl}/reports.php`).subscribe({
      next: (res) => { this.years = res; this.cdr.markForCheck(); },
    });
  }
}
