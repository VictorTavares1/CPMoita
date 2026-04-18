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

export const routes: Routes = [
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
];
