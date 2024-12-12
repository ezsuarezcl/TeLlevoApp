import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-restore',
  templateUrl: './password-restore.component.html',
  styleUrls: ['./password-restore.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class PasswordRestoreComponent {
  formPasswordRestore: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {
    this.formPasswordRestore = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmitRestore() {
    if (this.formPasswordRestore.invalid) {
      this.alertService.error(
        'Formulario inválido',
        'Por favor, ingresa un correo electrónico válido.'
      );
      return;
    }

    const { email } = this.formPasswordRestore.value;

    this.authService.passwordRestore(email).subscribe({
      next: () => {
        this.alertService.success(
          'Correo enviado',
          'Se ha enviado un enlace para restablecer tu contraseña. Verifica tu bandeja de entrada.'
        );
        this.formPasswordRestore.reset();
        setTimeout(() => this.router.navigateByUrl('/inicio-sesion'), 2000); // Redirección con retraso
      },
      error: (error) => {
        this.errorHandler.handleError(error).subscribe((friendlyMessage) => {
          this.alertService.error('Error', friendlyMessage);
        });
      },
    });
  }
}
