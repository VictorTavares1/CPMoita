import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NewsList } from './pages/news-list/news-list';
import { NewsDetailComponent } from './pages/news-detail/news-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'noticias', component: NewsList },
  { path: 'noticias/:id', component: NewsDetailComponent },
];
