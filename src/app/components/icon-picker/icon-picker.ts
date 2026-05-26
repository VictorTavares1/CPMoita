import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, OnChanges } from '@angular/core';

interface IconOption {
  class: string;
  label: string;
}

const SERVICOS_ICONS: IconOption[] = [
  { class: 'fa-solid fa-baby',               label: 'Bebé' },
  { class: 'fa-solid fa-children',           label: 'Crianças' },
  { class: 'fa-solid fa-child',              label: 'Criança' },
  { class: 'fa-solid fa-book-open',          label: 'Livro' },
  { class: 'fa-solid fa-graduation-cap',     label: 'Educação' },
  { class: 'fa-solid fa-school',             label: 'Escola' },
  { class: 'fa-solid fa-person-cane',        label: 'Idoso' },
  { class: 'fa-solid fa-house-medical',      label: 'Lar' },
  { class: 'fa-solid fa-house-user',         label: 'Apoio Dom.' },
  { class: 'fa-solid fa-wheelchair',         label: 'Mobilidade' },
  { class: 'fa-solid fa-heart',              label: 'Cuidados' },
  { class: 'fa-solid fa-hand-holding-heart', label: 'Apoio' },
  { class: 'fa-solid fa-utensils',           label: 'Alimentação' },
  { class: 'fa-solid fa-bed',                label: 'Alojamento' },
  { class: 'fa-solid fa-stethoscope',        label: 'Saúde' },
  { class: 'fa-solid fa-pills',              label: 'Medicação' },
  { class: 'fa-solid fa-users',              label: 'Grupo' },
  { class: 'fa-solid fa-church',             label: 'Igreja' },
  { class: 'fa-solid fa-star',               label: 'Destaque' },
  { class: 'fa-solid fa-leaf',               label: 'Natureza' },
];

const CONTACTOS_ICONS: IconOption[] = [
  { class: 'fa-solid fa-phone',          label: 'Telefone' },
  { class: 'fa-solid fa-mobile-screen',  label: 'Telemóvel' },
  { class: 'fa-solid fa-envelope',       label: 'Email' },
  { class: 'fa-solid fa-location-dot',   label: 'Morada' },
  { class: 'fa-brands fa-facebook',      label: 'Facebook' },
  { class: 'fa-brands fa-instagram',     label: 'Instagram' },
  { class: 'fa-brands fa-whatsapp',      label: 'WhatsApp' },
  { class: 'fa-solid fa-globe',          label: 'Website' },
  { class: 'fa-solid fa-fax',            label: 'Fax' },
  { class: 'fa-solid fa-clock',          label: 'Horário' },
];

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.html',
  styleUrl: './icon-picker.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class IconPicker implements OnChanges {
  @Input() value = '';
  @Input() mode: 'servicos' | 'contactos' = 'servicos';
  @Output() valueChange = new EventEmitter<string>();

  open = false;
  icons: IconOption[] = SERVICOS_ICONS;

  ngOnChanges(): void {
    this.icons = this.mode === 'contactos' ? CONTACTOS_ICONS : SERVICOS_ICONS;
  }

  get selectedLabel(): string {
    return this.icons.find(i => i.class === this.value)?.label ?? '';
  }

  toggle(): void {
    this.open = !this.open;
  }

  select(cls: string): void {
    this.valueChange.emit(cls);
    this.open = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('app-icon-picker')) {
      this.open = false;
    }
  }
}
