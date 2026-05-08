import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminServicesService } from '../../../services/admin-services';
import { ServiceLink } from '../../../services/services-list';
import { environment } from '../../../../environments/environment';

declare const Quill: any;

@Component({
  selector: 'app-admin-servicos-edit',
  templateUrl: './servicos-edit.html',
  imports: [RouterLink, FormsModule],
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
  readonly docsUrl    = environment.apiUrl + '/docs.php?file=';
  iconeOuImagem       = '';
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
      iconeOuImagem:       this.iconeOuImagem
    }).subscribe({
      next: () => this.router.navigate(['/admin/servicos']),
      error: () => { this.error.set('Erro ao guardar.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
