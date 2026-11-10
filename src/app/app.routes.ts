import { ProfilePage } from './pages/profile-page/profile-page';
import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { StudentsPage } from './pages/students-page/students-page';
import { PlaceholderPage } from './pages/placeholder-page/placeholder-page';
import { authGuard } from './guards/auth.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    component: StudentsPage,
    title: 'Class of 2028 · GIU Yearbook'
  },

  {
    path: 'teachers',
    component: PlaceholderPage,
    data: { title: 'Teachers & Staff' }
  },

  {
    path: 'gallery',
    component: PlaceholderPage,
    data: { title: 'Gallery' }
  },

  {
  path: 'login',
  component: LoginPage,
  title: 'Student Login · GIU Yearbook'
  },

  {
  path: 'profile',
  component: ProfilePage,
  canActivate: [authGuard],
  canDeactivate: [unsavedChangesGuard],
  title: 'My Profile · GIU Yearbook'
},

  {
    path: 'students/:id',
    component: PlaceholderPage,
    data: { title: 'Student story' }
  },

  {
    path: '**',
    redirectTo: ''
  },
];
