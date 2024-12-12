import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { RouterModule } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, RouterLink],
})
export class ToolbarComponent {
  private readonly LOGIN_ROUTE = '/login';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  logout() {
    this.alertService
      .confirm(
        '¿Cerrar sesión?',
        'Estás a punto de cerrar tu sesión. ¿Deseas continuar?',
        'Sí, cerrar sesión',
        'Cancelar'
      )
      .then((result) => {
        if (result) {
          this.authService.logout().subscribe({
            next: () => {
              this.alertService.success('Sesión cerrada', 'Has cerrado sesión exitosamente.');
              this.router.navigateByUrl(this.LOGIN_ROUTE);
            },
            error: (error) => {
              const errorMessage = error?.message || 'No se pudo cerrar sesión. Inténtalo nuevamente.';
              this.alertService.error('Error al cerrar sesión', errorMessage);
            },
          });
        }
      });
  }
}
