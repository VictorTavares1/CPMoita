import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminServicesService } from '../../../services/admin-services';
import { ServiceLink, ServiceImagem } from '../../../services/services-list';
import { environment } from '../../../../environments/environment';
import { IconPicker } from '../../../components/icon-picker/icon-picker';

declare const Quill: any;

@Component({
  selector: 'app-admin-servicos-edit',
  templateUrl: './servicos-edit.html',
  imports: [RouterLink, FormsModule, IconPicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServicosEdit implements OnInit, AfterViewInit {
  id                  = 0;
  titulo              = '';
  coordenador         = '';
  capacidade          = '';
  funcionamento       = '';
  servicosPrestados   : string[] = [];
  links               : ServiceLink[] = [];
  imagens             : ServiceImagem[] = [];
  readonly docsUrl    = environment.apiUrl + '/docs.php?file=';
  readonly uploadsUrl = environment.uploadsUrl + '/';
  iconeOuImagem       = '';

  readonly ninhoSalas = [
    { cor: 'verde',    label: 'Verde',    hex: '#2ecc71', textColor: '#fff' },
    { cor: 'azul',     label: 'Azul',     hex: '#3498db', textColor: '#fff' },
    { cor: 'amarela',  label: 'Amarela',  hex: '#f1c40f', textColor: '#000' },
    { cor: 'vermelha', label: 'Vermelha', hex: '#e74c3c', textColor: '#fff' },
  ];

  get isNinho(): boolean {
    return this.titulo.toLowerCase().includes('ninho');
  }

  get isCatl(): boolean {
    return this.titulo.toLowerCase().includes('barco') || this.titulo.toLowerCase().includes('catl');
  }

  get catlImagemPrincipal(): ServiceImagem | null {
    return this.imagens[0] ?? null;
  }

  get catlAtividades(): ServiceImagem[] {
    return this.imagens.slice(1);
  }

  setCatlImagemPrincipal(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.svc.uploadImage(file).subscribe({
      next: (res) => {
        const rest = this.imagens.slice(1);
        this.imagens = [{ titulo: 'principal', texto: '', filename: res.filename }, ...rest];
        input.value = '';
        this.cdr.markForCheck();
      },
      error: () => { this.error.set('Erro ao fazer upload da imagem.'); this.cdr.markForCheck(); }
    });
  }

  addCatlAtividade(): void {
    this.imagens = [...this.imagens, { titulo: '', texto: '', filename: '' }];
    this.cdr.markForCheck();
  }

  removeCatlAtividade(index: number): void {
    // index é relativo às atividades (slice(1)), por isso +1
    this.imagens = this.imagens.filter((_, i) => i !== index + 1);
    this.cdr.markForCheck();
  }

  updateCatlAtividade(index: number, field: keyof ServiceImagem, value: string): void {
    const realIndex = index + 1;
    this.imagens = this.imagens.map((img, i) => i === realIndex ? { ...img, [field]: value } : img);
  }

  imagensDaSala(cor: string): ServiceImagem[] {
    return this.imagens.filter(img => img.titulo.toLowerCase().trim() === cor);
  }

  removeImagemDaSala(cor: string, filename: string): void {
    this.imagens = this.imagens.filter(img => !(img.titulo.toLowerCase().trim() === cor && img.filename === filename));
    this.cdr.markForCheck();
  }

  uploadImagemSala(cor: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.svc.uploadImage(file).subscribe({
      next: (res) => {
        this.imagens = [...this.imagens, { titulo: cor, texto: '', filename: res.filename }];
        input.value = '';
        this.cdr.markForCheck();
      },
      error: () => { this.error.set('Erro ao fazer upload da imagem.'); this.cdr.markForCheck(); }
    });
  }
  loading = signal(true);
  saving  = signal(false);
  error   = signal('');

  private quill: any;
  private quillCentroDia: any;
  private quillReady = false;
  private pendingContent = '';
  private pendingCentroDia = '';

  constructor(
    private svc: AdminServicesService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cdr.markForCheck();
    this.svc.getAll().subscribe({
      next: (list) => {
        const s = list.find(x => x.id === this.id);
        if (s) {
          this.titulo            = s.titulo;
          this.coordenador       = s.coordenador ?? '';
          this.capacidade        = s.capacidade ?? '';
          this.funcionamento     = s.funcionamento ?? '';
          this.servicosPrestados = s.servicosPrestados ?? [];
          this.links             = s.links ?? [];
          this.imagens           = s.imagens ?? [];
          this.iconeOuImagem     = s.iconeOuImagem;
          this.pendingContent    = s.descricao;
          this.pendingCentroDia  = s.descricaoCentroDia ?? '';
          if (this.quillReady) {
            this.quill.root.innerHTML = s.descricao;
            this.quillCentroDia.root.innerHTML = s.descricaoCentroDia ?? '';
          }
        }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  ngAfterViewInit(): void {
    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ];
    setTimeout(() => {
      this.quill = new Quill('#servico-editor', { modules: { toolbar: toolbarOptions }, theme: 'snow' });
      if (this.id === 4) {
        this.quillCentroDia = new Quill('#centro-dia-editor', { modules: { toolbar: toolbarOptions }, theme: 'snow' });
        if (this.pendingCentroDia) this.quillCentroDia.root.innerHTML = this.pendingCentroDia;
      }
      this.quillReady = true;
      if (this.pendingContent) this.quill.root.innerHTML = this.pendingContent;
    }, 100);
  }

  addServico(): void {
    this.servicosPrestados = [...this.servicosPrestados, ''];
    this.cdr.markForCheck();
  }

  removeServico(index: number): void {
    this.servicosPrestados = this.servicosPrestados.filter((_, i) => i !== index);
    this.cdr.markForCheck();
  }

  updateServico(index: number, value: string): void {
    this.servicosPrestados = this.servicosPrestados.map((s, i) => i === index ? value : s);
  }

  addLink(): void {
    this.links = [...this.links, { label: '', filename: '' }];
    this.cdr.markForCheck();
  }

  addImagem(): void {
    this.imagens = [...this.imagens, { titulo: '', texto: '', filename: '' }];
    this.cdr.markForCheck();
  }

  removeImagem(index: number): void {
    this.imagens = this.imagens.filter((_, i) => i !== index);
    this.cdr.markForCheck();
  }

  updateImagem(index: number, field: keyof ServiceImagem, value: string): void {
    this.imagens = this.imagens.map((img, i) => i === index ? { ...img, [field]: value } : img);
  }

  uploadImagem(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.svc.uploadImage(file).subscribe({
      next: (res) => {
        const updated = [...this.imagens];
        updated[index] = { ...updated[index], filename: res.filename };
        this.imagens = updated;
        input.value = '';
        this.cdr.markForCheck();
      },
      error: () => { this.error.set('Erro ao fazer upload da imagem.'); this.cdr.markForCheck(); }
    });
  }

  uploadDoc(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.svc.uploadDoc(file).subscribe({
      next: (res) => {
        const updated = [...this.links];
        updated[index] = { label: updated[index].label || res.name, filename: res.filename };
        this.links = updated;
        input.value = '';
        this.cdr.markForCheck();
      },
      error: () => { this.error.set('Erro ao fazer upload do ficheiro.'); this.cdr.markForCheck(); }
    });
  }

  removeLink(index: number): void {
    this.links = this.links.filter((_, i) => i !== index);
    this.cdr.markForCheck();
  }

  updateLink(index: number, field: 'label' | 'filename', value: string): void {
    this.links = this.links.map((l, i) => i === index ? { ...l, [field]: value } : l);
  }

  trackByIndex(index: number): number {
    return index;
  }

  save(): void {
    const descricao        = this.quill?.root.innerHTML.trim() ?? '';
    const descricaoCentroDia = this.quillCentroDia?.root.innerHTML.trim() ?? '';
    if (!this.titulo.trim() || !this.iconeOuImagem.trim() || !descricao || descricao === '<p><br></p>') {
      this.error.set('Preencha todos os campos obrigatórios.');
      this.cdr.markForCheck();
      return;
    }
    this.error.set('');
    this.saving.set(true);
    this.svc.update({
      id: this.id,
      titulo: this.titulo,
      descricao,
      coordenador:         this.coordenador       || null,
      capacidade:          this.capacidade        || null,
      funcionamento:       this.funcionamento     || null,
      servicosPrestados:   this.servicosPrestados.filter(s => s.trim()),
      descricaoCentroDia:  descricaoCentroDia === '<p><br></p>' ? null : descricaoCentroDia || null,
      links:               this.links.filter(l => l.label.trim() && l.filename.trim()),
      imagens:             this.imagens.filter(img => img.filename.trim()),
      iconeOuImagem:       this.iconeOuImagem
    }).subscribe({
      next: () => this.router.navigate(['/admin/servicos']),
      error: () => { this.error.set('Erro ao guardar.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
