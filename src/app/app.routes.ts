import { Routes } from '@angular/router';
import { DiaryPage } from './features/diary/diary-page/diary-page';
import { LogPage } from './features/log/log-page/log-page';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { EditEntryPage } from './features/log/edit-entry-page/edit-entry-page';
import { SharedDiaryPage } from './features/shared-diary/shared-diary-page';
import { EntryDetailPage } from './features/log/entry-detail-page/entry-detail-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'log', component: LogPage },
  { path: 'diary/:period', component: DiaryPage },
  { path: 'edit/:id', component: EditEntryPage },
  { path: 'entry/:id', component: EntryDetailPage },
  { path: 'dashboard', component: DashboardPage },
  { path: 'shared/:shareId', component: SharedDiaryPage },
  { path: '**', redirectTo: 'dashboard' }
];
