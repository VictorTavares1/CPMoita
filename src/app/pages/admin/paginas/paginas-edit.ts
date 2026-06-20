import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminPageContentsService } from '../../../services/admin-page-contents';
import { environment } from '../../../../environments/environment';

declare const Quill: any;

@Component({
  selector: 'app-admin-paginas-edit',
  templateUrl: './paginas-edit.html',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPaginasEdit implements OnInit, AfterViewInit {
  id             = 0;
  chave          = '';
  pagina         = '';
  tipo           = '';
  conteudoPagina = '';
  linkLabel    = '';
  linkFilename = '';
  loading = signal(true);
  saving  = signal(false);
  error   = signal('');

  docsUrl = environment.apiUrl + '/docs.php?file=';

  private quill: any;
  private quillReady = false;
  private pendingContent = '';

  constructor(
    private svc: AdminPageContentsService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getAll().subscribe({
      next: (list) => {
        const c = list.find(x => x.id === this.id);
        if (c) {
          this.chave          = c['chaveSecção'];
          this.pagina         = c.nomePagina;
          this.tipo           = c.tipoConteudo;
          this.conteudoPagina = c.conteudoPagina;

          if (this.tipo === 'link') {
            try {
              const parsed = JSON.parse(c.conteudoPagina);
              this.linkLabel    = parsed.label    ?? '';
              this.linkFilename = parsed.filename ?? '';
            } catch {
              this.linkLabel = c.conteudoPagina;
            }
          } else {
            this.pendingContent = c.conteudoPagina;
            if (this.quillReady) this.quill.root.innerHTML = c.conteudoPagina;
          }
        }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  ngAfterViewInit(): void {
    this.initQuill();
  }

  private initQuill(): void {
    setTimeout(() => {
      if (document.getElementById('pagina-editor')) {
        this.quill = new Quill('#pagina-editor', {
          modules: { toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean']
          ]},
          theme: 'snow'
        });
        this.quillReady = true;
        if (this.pendingContent) this.quill.root.innerHTML = this.pendingContent;
      }
    }, 200);
  }

  uploadDoc(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.svc.uploadDoc(file).subscribe({
      next: (res) => {
        this.linkFilename = res.filename;
        this.cdr.markForCheck();
      },
      error: () => { this.error.set('Erro ao fazer upload do ficheiro.'); this.cdr.markForCheck(); }
    });
  }

  save(): void {
    if (this.tipo === 'link') {
      if (!this.linkLabel.trim()) {
        this.error.set('O título do link não pode estar vazio.');
        this.cdr.markForCheck();
        return;
      }
      if (!this.linkFilename.trim()) {
        this.error.set('Por favor, selecione um ficheiro.');
        this.cdr.markForCheck();
        return;
      }
      this.saving.set(true);
      this.svc.updateLink(this.id, this.linkLabel, this.linkFilename).subscribe({
        next: () => this.router.navigate(['/admin/paginas']),
        error: () => { this.error.set('Erro ao guardar.'); this.saving.set(false); this.cdr.markForCheck(); }
      });
      return;
    }

    const conteudo = this.tipo === 'text'
      ? this.conteudoPagina.trim()
      : (this.quill?.root.innerHTML.trim() ?? '');
    if (!conteudo || conteudo === '<p><br></p>') {
      this.error.set('O conteúdo não pode estar vazio.');
      this.cdr.markForCheck();
      return;
    }

    this.saving.set(true);
    this.svc.update(this.id, conteudo, this.tipo).subscribe({
      next: () => this.router.navigate(['/admin/paginas']),
      error: () => { this.error.set('Erro ao guardar.'); this.saving.set(false); this.cdr.markForCheck(); }
    });
  }
}
