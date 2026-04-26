import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminNewsService } from '../../../services/admin-news';

declare const Quill: any;

@Component({
  selector: 'app-admin-noticias-add',
  templateUrl: './noticias-add.html',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNoticiasAdd implements AfterViewInit {
  titulo = '';
  loading = signal(false);
  error = signal('');
  private quill: any;

  constructor(private svc: AdminNewsService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.quill = new Quill('#editor', {
        modules: { toolbar: true },
        theme: 'snow',
      });
    }, 50);
  }

  getSelectedFiles(): FileList | null {
    const input = document.getElementById('imgInput') as HTMLInputElement;
    return input?.files ?? null;
  }

  submit(): void {
    const conteudo = this.quill?.root.innerHTML.trim() ?? '';
    if (!this.titulo.trim() || conteudo === '<p><br></p>' || !conteudo) {
      this.error.set('Preencha o título e o conteúdo.');
      this.cdr.markForCheck();
      return;
    }
    this.error.set('');
    this.loading.set(true);

    const fd = new FormData();
    fd.append('titulo', this.titulo);
    fd.append('conteudo', conteudo);
    const files = this.getSelectedFiles();
    if (files) {
      for (let i = 0; i < files.length; i++) fd.append('img[]', files[i]);
    }

    this.svc.create(fd).subscribe({
      next: () => this.router.navigate(['/admin/noticias'], { state: { toast: 'Notícia inserida com sucesso.' } }),
      error: () => {
        this.loading.set(false);
        this.error.set('Erro ao inserir notícia. Tente novamente.');
        this.cdr.markForCheck();
      }
    });
  }
}
