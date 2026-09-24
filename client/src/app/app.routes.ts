import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { TripListComponent } from './features/trips/trip-list/trip-list.component';
import { TripCreateComponent } from './features/trips/trip-create/trip-create.component';
import { TripDetailComponent } from './features/trips/trip-detail/trip-detail.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'trips',
    component: TripListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trips/new',
    component: TripCreateComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trips/:id',
    component: TripDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'trips'
  },
  {
    path: '**',
    redirectTo: 'trips'
  }
];
