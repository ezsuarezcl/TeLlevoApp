import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearCuentaComponent } from '../app/pages/register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { of } from 'rxjs';

describe('CrearCuentaComponent (Standalone)', () => {
  let component: CrearCuentaComponent;
  let fixture: ComponentFixture<CrearCuentaComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        CrearCuentaComponent, // Importa el componente directamente porque es standalone
        ReactiveFormsModule, // Importa formularios reactivos
        RouterTestingModule, // Simula el enrutamiento
        IonicModule.forRoot(), // Carga las dependencias de Ionic
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }, // Mock del AuthService
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con campos vacíos', () => {
    const form = component.formCrearCuenta;
    expect(form.get('nombre')?.value).toBe('');
    expect(form.get('correo')?.value).toBe('');
    expect(form.get('contrasena')?.value).toBe('');
  });

  it('debería mostrar mensajes de error si los campos están vacíos o inválidos', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Simula que el usuario tocó los campos pero no ingresó datos
    component.formCrearCuenta.get('nombre')?.markAsTouched();
    component.formCrearCuenta.get('correo')?.markAsTouched();
    component.formCrearCuenta.get('contrasena')?.markAsTouched();
    fixture.detectChanges();

    const nombreError = compiled.querySelector('#nombre + span')?.textContent?.trim();
    const correoError = compiled.querySelector('#correo + span')?.textContent?.trim();
    const contrasenaError = compiled.querySelector('#contrasena + span')?.textContent?.trim();

    expect(nombreError).toBe('Por favor, ingrese un nombre.');
    expect(correoError).toBe('Por favor, ingrese un correo válido.');
    expect(contrasenaError).toBe('Por favor, ingrese una contraseña válida.');
  });

  it('debería habilitar el botón de crear cuenta solo si el formulario es válido', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('ion-button[type="submit"]') as HTMLButtonElement;

    // Inicialmente el formulario es inválido
    expect(submitButton.disabled).toBeTrue();

    // Llena el formulario con datos válidos
    component.formCrearCuenta.setValue({
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      contrasena: 'password123',
    });
    fixture.detectChanges();

    // Ahora el botón debe estar habilitado
    expect(submitButton.disabled).toBeFalse();
  });

  it('debería llamar al método onSubmitRegister() al enviar el formulario', () => {
    spyOn(component, 'onSubmitRegister');

    const compiled = fixture.nativeElement as HTMLElement;
    const formElement = compiled.querySelector('form') as HTMLFormElement;

    // Llena el formulario con datos válidos y envía el formulario
    component.formCrearCuenta.setValue({
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      contrasena: 'password123',
    });
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.onSubmitRegister).toHaveBeenCalled();
  });

  it('debería llamar al servicio AuthService.register() con los datos correctos', () => {
    authServiceSpy.register.and.returnValue(of(true));

    // Llena el formulario con datos válidos
    component.formCrearCuenta.setValue({
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      contrasena: 'password123',
    });

    // Llama al método de envío
    component.onSubmitRegister();
    fixture.detectChanges();

    expect(authServiceSpy.register).toHaveBeenCalledWith('Juan Pérez', 'juan@example.com', 'password123');
  });
});
