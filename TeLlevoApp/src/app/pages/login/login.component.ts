import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterLink],
})
export class LoginComponent {
  formLogin: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {
    this.formLogin = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
    });
  }

  onSubmitLogin() {
    if (this.formLogin.invalid) {
      this.alertService.error(
        'Formulario inválido',
        'Por favor, completa todos los campos correctamente.'
      );
      return;
    }

    const { correo, contrasena } = this.formLogin.value;

    this.authService.login(correo, contrasena).subscribe({
      next: () => {
        this.alertService.success(
          'Inicio de sesión exitoso',
          'Bienvenido de nuevo!'
        );
        this.formLogin.reset();
        this.router.navigateByUrl('home/map');
      },
      error: (error) => {
        this.errorHandler.handleError(error).subscribe((friendlyMessage) => {
          this.alertService.error('Error de inicio de sesión', friendlyMessage);
        });
      },
    });
  }
}
