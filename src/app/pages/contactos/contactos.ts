import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news';
import { ContactsService, Contact } from '../../services/contacts';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contactos',
  imports: [RouterLink],
  templateUrl: './contactos.html',
  styleUrl: './contactos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contactos implements OnInit {
  sidebarNews: NewsItem[] = [];
  contacts: Contact[] = [];

  constructor(
    private newsService: NewsService,
    private contactsService: ContactsService,
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
}
