import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { By } from '@angular/platform-browser';
import { RecuperarContrasenaComponent } from './password-restore.component';
import { AuthService } from '../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

// Mock de Firestore
class FirestoreMock {
  collection() {
    return {
      doc: () => ({
        set: jasmine.createSpy('set'),
        get: jasmine.createSpy('get').and.returnValue(of({})),
      }),
    };
  }
}

// Mock de AuthService
class AuthServiceMock {
  recuperarContrasena(email: string) {
    return of(true); // Simula un observable que retorna éxito
  }
}

describe('RecuperarContrasenaComponent', () => {
  let component: RecuperarContrasenaComponent;
  let fixture: ComponentFixture<RecuperarContrasenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        RecuperarContrasenaComponent, // Importar el componente standalone
      ],
      providers: [
        { provide: Firestore, useClass: FirestoreMock }, // Proveer el mock de Firestore
        { provide: AuthService, useClass: AuthServiceMock }, // Proveer el mock de AuthService
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperarContrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Actualizar el DOM
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener un formulario con el campo email', () => {
    const emailControl = component.formRecuperarContrasena.get('email');
    expect(emailControl).toBeTruthy();
    expect(emailControl.invalid).toBeTrue(); // El campo es inválido inicialmente
  });

  it('debería validar el campo email correctamente', () => {
    const emailControl = component.formRecuperarContrasena.get('email');

    // Campo vacío
    emailControl.setValue('');
    expect(emailControl.invalid).toBeTrue();

    // Email inválido
    emailControl.setValue('correo-invalido');
    expect(emailControl.invalid).toBeTrue();

    // Email válido
    emailControl.setValue('correo@valido.com');
    expect(emailControl.valid).toBeTrue();
  });

  it('debería habilitar el botón de enviar solo si el formulario es válido', () => {
    const boton = fixture.debugElement.query(By.css('ion-button[type="submit"]')).nativeElement;

    // Formulario inválido inicialmente
    expect(boton.disabled).toBeTrue();

    // Formulario válido
    component.formRecuperarContrasena.get('email').setValue('correo@valido.com');
    fixture.detectChanges(); // Actualizar el DOM
    expect(boton.disabled).toBeFalse();
  });

  it('debería llamar a onSubmitRecuperar al enviar el formulario', () => {
    spyOn(component, 'onSubmitRecuperar'); // Espiar el método onSubmitRecuperar

    // Configurar el formulario como válido
    component.formRecuperarContrasena.get('email').setValue('correo@valido.com');
    fixture.detectChanges();

    // Simular envío de formulario
    const formulario = fixture.debugElement.query(By.css('form'));
    formulario.triggerEventHandler('ngSubmit', null);

    expect(component.onSubmitRecuperar).toHaveBeenCalled();
  });
});
