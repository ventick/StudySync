import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { GroupDetailPageComponent } from './pages/group-detail-page.component';
import { GroupFormPageComponent } from './pages/group-form-page.component';
import { GroupsPageComponent } from './pages/groups-page.component';
import { LoginPageComponent } from './pages/login-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'groups' },
  { path: 'login', component: LoginPageComponent },
  { path: 'groups', component: GroupsPageComponent, canActivate: [authGuard] },
  { path: 'groups/new', component: GroupFormPageComponent, canActivate: [authGuard] },
  { path: 'groups/:id', component: GroupDetailPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'groups' }
];
