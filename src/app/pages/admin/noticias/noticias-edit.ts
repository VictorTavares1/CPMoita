import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminNewsService, AdminNewsDetail } from '../../../services/admin-news';
import { environment } from '../../../../environments/environment';

declare const Quill: any;

@Component({
  selector: 'app-admin-noticias-edit',
  templateUrl: './noticias-edit.html',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNoticiasEdit implements OnInit, AfterViewInit {
  news: AdminNewsDetail | null = null;
  titulo = '';
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  toast = signal('');
  private quill: any;
  private newsId = 0;
  private quillReady = false;
  private pendingContent = '';

  constructor(
    private svc: AdminNewsService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.newsId = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(this.newsId).subscribe({
      next: (data) => {
        this.news = data;
        this.titulo = data.title;
        this.pendingContent = data.content;
        this.loading.set(false);
        if (this.quillReady) this.quill.root.innerHTML = data.content;
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.quill = new Quill('#editor', { modules: { toolbar: true }, theme: 'snow' });
      this.quillReady = true;
      if (this.pendingContent) this.quill.root.innerHTML = this.pendingContent;
    }, 100);
  }

  save(): void {
    const conteudo = this.quill?.root.innerHTML.trim() ?? '';
    if (!this.titulo.trim() || conteudo === '<p><br></p>' || !conteudo) {
      this.error.set('Preencha o título e o conteúdo.');
      this.cdr.markForCheck();
      return;
    }
    this.error.set('');
    this.saving.set(true);
    this.svc.update(this.newsId, this.titulo, conteudo).subscribe({
      next: () => {
        this.saving.set(false);
        this.showToast('Notícia guardada com sucesso.');
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Erro ao guardar. Tente novamente.');
        this.cdr.markForCheck();
      }
    });
  }

  uploadImages(): void {
    const input = document.getElementById('imgInput') as HTMLInputElement;
    if (!input?.files?.length) return;
    this.svc.uploadImages(this.newsId, input.files).subscribe({
      next: (res) => {
        this.news!.images.push(...res.images);
        input.value = '';
        this.showToast('Imagens adicionadas.');
        this.cdr.markForCheck();
      },
      error: () => { this.error.set('Erro ao carregar imagens.'); this.cdr.markForCheck(); }
    });
  }

  deleteImage(imgId: number): void {
    if (!confirm('Apagar esta imagem?')) return;
    this.svc.deleteImage(imgId).subscribe({
      next: () => {
        this.news!.images = this.news!.images.filter(i => i.id !== imgId);
        this.showToast('Imagem apagada.');
        this.cdr.markForCheck();
      },
      error: () => { this.error.set('Erro ao apagar imagem.'); this.cdr.markForCheck(); }
    });
  }

  showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => { this.toast.set(''); this.cdr.markForCheck(); }, 3500);
  }

  imageUrl(url: string): string {
    return `${environment.uploadsUrl}/${url}`;
  }
}
