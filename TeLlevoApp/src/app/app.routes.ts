import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PasswordRestoreComponent } from './pages/password-restore/password-restore.component';
import { JourneysComponent } from './pages/journeys/journeys.component';
import { MapComponent } from './pages/map/map.component';
import { MyJourneysComponent } from './pages/my-journeys/my-journeys.component';
import { QrScannerComponent } from './pages/qr-scanner/qr-scanner.component';

export const routes: Routes = [
  // Rutas públicas
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'password-restore',
    component: PasswordRestoreComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Rutas privadas bajo layout (requieren autenticación)
  {
    path: 'home',
    loadComponent: () => import('./layout/layout.component'),
    canActivate: [authGuard],
    children: [
      {
        path: 'journeys',
        component: JourneysComponent,
      },
      {
        path: 'map',
        component: MapComponent,
      },
      {
        path: 'my-journeys',
        component: MyJourneysComponent,
      },
      {
        path: 'qr-scanner',
        component: QrScannerComponent,
      },
      {
        path: '',
        redirectTo: 'map',
        pathMatch: 'full',
      },
    ],
  },


  // Ruta wildcard para 404
  {
    path: '**',
    redirectTo: 'login',
  },
];
