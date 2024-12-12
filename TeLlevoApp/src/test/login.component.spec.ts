import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioSesionComponent } from '../app/pages/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { of } from 'rxjs';

describe('InicioSesionComponent (Standalone)', () => {
  let component: InicioSesionComponent;
  let fixture: ComponentFixture<InicioSesionComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [
        InicioSesionComponent, // Importa el componente directamente porque es standalone
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
    fixture = TestBed.createComponent(InicioSesionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con campos vacíos', () => {
    const form = component.formLogin;
    expect(form.get('correo')?.value).toBe('');
    expect(form.get('contrasena')?.value).toBe('');
  });

  it('debería mostrar mensajes de error si los campos están vacíos o inválidos', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Simula que el usuario tocó los campos pero no ingresó datos
    component.formLogin.get('correo')?.markAsTouched();
    component.formLogin.get('contrasena')?.markAsTouched();
    fixture.detectChanges();

    const correoError = compiled.querySelector('#correo + span')?.textContent?.trim();
    const contrasenaError = compiled.querySelector('#contrasena + span')?.textContent?.trim();

    expect(correoError).toBe('Por favor, ingrese un correo válido.');
    expect(contrasenaError).toBe('La contraseña es obligatoria.');
  });

  it('debería habilitar el botón "Iniciar sesión" solo si el formulario es válido', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('ion-button[type="submit"]') as HTMLButtonElement;

    // Inicialmente el formulario es inválido
    expect(submitButton.disabled).toBeTrue();

    // Llena el formulario con datos válidos
    component.formLogin.setValue({
      correo: 'juan@example.com',
      contrasena: 'password123',
    });
    fixture.detectChanges();

    // Ahora el botón debe estar habilitado
    expect(submitButton.disabled).toBeFalse();
  });

  it('debería llamar al método onSubmitLogin() al enviar el formulario', () => {
    spyOn(component, 'onSubmitLogin');

    const compiled = fixture.nativeElement as HTMLElement;
    const formElement = compiled.querySelector('form') as HTMLFormElement;

    // Llena el formulario con datos válidos y envía el formulario
    component.formLogin.setValue({
      correo: 'juan@example.com',
      contrasena: 'password123',
    });
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.onSubmitLogin).toHaveBeenCalled();
  });

  it('debería llamar al servicio AuthService.login() con los datos correctos', () => {
    authServiceSpy.login.and.returnValue(of(true));

    // Llena el formulario con datos válidos
    component.formLogin.setValue({
      correo: 'juan@example.com',
      contrasena: 'password123',
    });

    // Llama al método de envío
    component.onSubmitLogin();
    fixture.detectChanges();

    expect(authServiceSpy.login).toHaveBeenCalledWith('juan@example.com', 'password123');
  });

  it('debería contener un enlace para recuperar contraseña', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const recuperarContrasenaLink = compiled.querySelector('a[routerLink="/recuperar-contrasena"]') as HTMLAnchorElement;

    expect(recuperarContrasenaLink).toBeTruthy();
    expect(recuperarContrasenaLink.getAttribute('routerLink')).toBe('/recuperar-contrasena');
    expect(recuperarContrasenaLink.textContent?.trim()).toBe('Recuperar contraseña');
  });

  it('debería contener un botón para crear cuenta', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const crearCuentaButton = compiled.querySelector('ion-button[routerLink="/crear-cuenta"]') as HTMLButtonElement;

    expect(crearCuentaButton).toBeTruthy();
    expect(crearCuentaButton.getAttribute('routerLink')).toBe('/crear-cuenta');
    expect(crearCuentaButton.textContent?.trim()).toBe('Crear cuenta');
  });
});
