import { Routes } from '@angular/router';

import { HelpPageComponent } from './pages/help-page/help-page.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'help', component: HelpPageComponent },
  { path: '**', redirectTo: '' },
];
