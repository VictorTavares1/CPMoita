import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { ContactsService, Contact } from '../../services/contacts';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  contacts: Contact[] = [];

  constructor(
    private router: Router,
    private contactsService: ContactsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.contactsService.getContacts().subscribe({
      next: (data) => { this.contacts = data; this.cdr.markForCheck(); },
      error: (err) => console.error('Erro ao carregar contactos:', err),
    });
  }

  getContact(tipo: string): Contact | undefined {
    return this.contacts.find(c => c.tipo === tipo);
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/noticias'], { queryParams: { search: query.trim() } });
    }
  }
}
