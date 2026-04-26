import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  template: `
    @if (!isAdmin()) {
      <app-navbar />
    }
    <main [class.no-shell]="isAdmin()">
      <router-outlet />
    </main>
    @if (!isAdmin()) {
      <app-footer />
    }
  `,
  styles: [`
    main { flex: 1; }
    main.no-shell { flex: none; }
    app-navbar { display: block; position: sticky; top: 0; z-index: 1000; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private router = inject(Router);

  isAdmin = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects.startsWith('/admin'))
    ),
    { initialValue: window.location.pathname.startsWith('/admin') }
  );
}
