import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NewsList } from './pages/news-list/news-list';
import { NewsDetailComponent } from './pages/news-detail/news-detail';
import { Instituicao } from './pages/instituicao/instituicao';
import { OrgaosSociais } from './pages/orgaos-sociais/orgaos-sociais';
import { Horarios } from './pages/horarios/horarios';
import { Contactos } from './pages/contactos/contactos';
import { Relatorios } from './pages/relatorios/relatorios';
import { Creche } from './pages/servicos/creche/creche';
import { Ninho } from './pages/servicos/ninho/ninho';
import { Catl } from './pages/servicos/catl/catl';
import { Erpi } from './pages/servicos/erpi/erpi';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes — eager (utilizadores públicos precisam destes componentes imediatamente)
  { path: '', component: Home },
  { path: 'noticias', component: NewsList },
  { path: 'noticias/:id', component: NewsDetailComponent },
  { path: 'instituicao', component: Instituicao },
  { path: 'orgaos-sociais', component: OrgaosSociais },
  { path: 'horarios', component: Horarios },
  { path: 'contactos', component: Contactos },
  { path: 'relatorios', component: Relatorios },
  { path: 'servicos/creche', component: Creche },
  { path: 'servicos/ninho', component: Ninho },
  { path: 'servicos/catl', component: Catl },
  { path: 'servicos/erpi', component: Erpi },

  // Admin login — lazy (só carregado quando necessário)
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/login').then(m => m.AdminLogin),
  },

  // Admin protected routes — todos lazy (não carregados para utilizadores públicos)
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',           loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.AdminDashboard) },
      { path: 'noticias',            loadComponent: () => import('./pages/admin/noticias/noticias-list').then(m => m.AdminNoticias) },
      { path: 'noticias/add',        loadComponent: () => import('./pages/admin/noticias/noticias-add').then(m => m.AdminNoticiasAdd) },
      { path: 'noticias/edit/:id',   loadComponent: () => import('./pages/admin/noticias/noticias-edit').then(m => m.AdminNoticiasEdit) },
      { path: 'contactos',           loadComponent: () => import('./pages/admin/contactos/contactos-list').then(m => m.AdminContactos) },
      { path: 'contactos/add',       loadComponent: () => import('./pages/admin/contactos/contactos-add').then(m => m.AdminContactosAdd) },
      { path: 'contactos/edit/:id',  loadComponent: () => import('./pages/admin/contactos/contactos-edit').then(m => m.AdminContactosEdit) },
      { path: 'servicos',            loadComponent: () => import('./pages/admin/servicos/servicos-list').then(m => m.AdminServicos) },
      { path: 'servicos/add',        loadComponent: () => import('./pages/admin/servicos/servicos-add').then(m => m.AdminServicosAdd) },
      { path: 'servicos/edit/:id',   loadComponent: () => import('./pages/admin/servicos/servicos-edit').then(m => m.AdminServicosEdit) },
      { path: 'paginas',             loadComponent: () => import('./pages/admin/paginas/paginas-list').then(m => m.AdminPaginas) },
      { path: 'paginas/edit/:id',    loadComponent: () => import('./pages/admin/paginas/paginas-edit').then(m => m.AdminPaginasEdit) },
      { path: 'relatorios',          loadComponent: () => import('./pages/admin/relatorios/relatorios-list').then(m => m.AdminRelatorios) },
      { path: 'relatorios/add',      loadComponent: () => import('./pages/admin/relatorios/relatorios-add').then(m => m.AdminRelatoriosAdd) },
      { path: 'administradores',     loadComponent: () => import('./pages/admin/admins/admins-list').then(m => m.AdminAdmins) },
      { path: 'administradores/add', loadComponent: () => import('./pages/admin/admins/admins-add').then(m => m.AdminAdminsAdd) },
      { path: 'logs',                loadComponent: () => import('./pages/admin/logs/logs-list').then(m => m.AdminLogs) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
