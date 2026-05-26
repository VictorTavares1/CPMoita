import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NewsService, NewsItem } from '../../services/news';
import { ContactsService, Contact } from '../../services/contacts';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contactos',
  imports: [RouterLink, FormsModule],
  templateUrl: './contactos.html',
  styleUrl: './contactos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contactos implements OnInit {
  sidebarNews: NewsItem[] = [];
  contacts: Contact[] = [];

  form = { nome: '', email: '', assunto: '', mensagem: '' };
  sending = signal(false);
  formSuccess = signal('');
  formError = signal('');

  constructor(
    private newsService: NewsService,
    private contactsService: ContactsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.newsService.getNews(1, 5).subscribe({
      next: (res) => { this.sidebarNews = res.data; this.cdr.markForCheck(); },
    });

    this.contactsService.getContacts().subscribe({
      next: (data) => { this.contacts = data; this.cdr.markForCheck(); },
    });
  }

  getContact(tipo: string): Contact | undefined {
    return this.contacts.find(c => c.tipo === tipo);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-PT');
  }

  getNewsImageUrl(url: string | null): string {
    if (!url) return '/images/cpm.png';
    if (url.startsWith('http')) return url;
    return `${environment.uploadsUrl}/${url}`;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/images/cpm.png';
  }

  sendMessage(): void {
    this.formSuccess.set('');
    this.formError.set('');
    this.sending.set(true);
    this.http.post<{ success: boolean; message: string }>(
      `${environment.apiUrl}/send-contact.php`,
      this.form
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.formSuccess.set('Mensagem enviada com sucesso! Entraremos em contacto brevemente.');
          this.form = { nome: '', email: '', assunto: '', mensagem: '' };
        } else {
          this.formError.set(res.message || 'Erro ao enviar a mensagem.');
        }
        this.sending.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.formError.set('Erro ao enviar a mensagem. Tente novamente mais tarde.');
        this.sending.set(false);
        this.cdr.markForCheck();
      }
    });
  }
}
