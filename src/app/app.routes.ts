import { Routes } from '@angular/router';
import { DiaryPage } from './features/diary/diary-page/diary-page';
import { LogPage } from './features/log/log-page/log-page';
import { PublicProfilePage } from './features/public/public-profile-page/public-profile-page';
import { EditEntryPage } from './features/log/edit-entry-page/edit-entry-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'diary/daily' },
  { path: 'log', component: LogPage },
  { path: 'diary/:period', component: DiaryPage },
  { path: 'edit/:id', component: EditEntryPage },
  { path: 'u/:slug', component: PublicProfilePage },
  { path: '**', redirectTo: 'diary/daily' }
];
