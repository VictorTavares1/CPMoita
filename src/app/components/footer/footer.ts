import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactsService, Contact } from '../../services/contacts';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer implements OnInit {
  contacts: Contact[] = [];

  constructor(
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
}
