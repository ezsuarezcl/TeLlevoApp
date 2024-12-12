import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AlertService } from 'src/app/services/alert.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class RegisterComponent {
  formRegister: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {
    this.formRegister = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmitRegister() {
    if (this.formRegister.invalid) {
      this.alertService.error(
        'Formulario inválido',
        'Por favor, completa todos los campos correctamente.'
      );
      return;
    }

    const { name, email, password } = this.formRegister.value;

    this.authService.register(name, email, password).subscribe(
      () => {
        this.alertService.success(
          'Cuenta creada',
          'Tu cuenta se ha creado exitosamente.'
        );
        this.formRegister.reset();
        this.router.navigateByUrl('/login');
      },
      (error) => {
        console.error('Detalles del error de registro:', error);

        this.errorHandler.handleError(error).subscribe((friendlyMessage) => {
          this.alertService.error(
            'Error de registro',
            friendlyMessage || 'Hubo un problema al registrar la cuenta. Inténtalo de nuevo.'
          );
        });
      }
    );
  }
}
