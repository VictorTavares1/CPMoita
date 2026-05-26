import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef,
  signal, NgZone, AfterViewInit, ElementRef, ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { environment } from '../../../../environments/environment';

declare const grecaptcha: any;

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLogin implements AfterViewInit {
  @ViewChild('recaptchaContainer') recaptchaContainer!: ElementRef<HTMLDivElement>;

  email = '';
  password = '';
  error = signal('');
  loading = signal(false);
  sessionExpired = signal(false);
  showPassword = signal(false);
  recaptchaToken = signal('');

  private widgetId: number | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {
    const nav = this.router.getCurrentNavigation();
    if ((nav?.extras?.state as { sessionExpired?: boolean })?.sessionExpired) {
      this.sessionExpired.set(true);
    }
  }

  ngAfterViewInit(): void {
    const renderWidget = () => {
      this.widgetId = grecaptcha.render(this.recaptchaContainer.nativeElement, {
        sitekey: environment.recaptchaSiteKey,
        callback: (token: string) => {
          this.zone.run(() => {
            this.recaptchaToken.set(token);
            this.cdr.markForCheck();
          });
        },
        'expired-callback': () => {
          this.zone.run(() => {
            this.recaptchaToken.set('');
            this.cdr.markForCheck();
          });
        },
      });
    };

    if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
      renderWidget();
    } else {
      (window as any)['onRecaptchaLoad'] = renderWidget;
    }
  }

  onSubmit(): void {
    if (!this.recaptchaToken()) {
      this.error.set('Por favor confirme que não é um robô.');
      return;
    }

    this.error.set('');
    this.sessionExpired.set(false);
    this.loading.set(true);

    this.auth.login(this.email, this.password, this.recaptchaToken()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.recaptchaToken.set('');
        if (this.widgetId !== null) grecaptcha.reset(this.widgetId);
        if (err.status === 401) {
          this.error.set('Email ou password incorretos.');
        } else if (err.status === 429) {
          this.error.set('Demasiadas tentativas. Aguarde 15 minutos.');
        } else if (err.status === 400) {
          this.error.set('Verificação reCAPTCHA falhou. Tente novamente.');
        } else {
          this.error.set('Erro de ligação. Tente novamente.');
        }
        this.cdr.markForCheck();
      },
    });
  }
}
