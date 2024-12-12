import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolbarComponent } from './toolbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Firestore } from '@angular/fire/firestore';

describe('ToolbarComponent (Standalone)', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>; // Agregamos referencia al mock del servicio

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']); // Mock del servicio

    await TestBed.configureTestingModule({
      imports: [
        ToolbarComponent, // Importa el componente directamente como standalone
        RouterTestingModule, // Simula el enrutamiento
        IonicModule.forRoot(), // Carga las dependencias de Ionic
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }, // Proveedor del mock
        { provide: Firestore, useValue: {} }, // Mock vacío para Firestore
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería contener un logo con enlace a "/layout/mapa"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoLink = compiled.querySelector('.navbar-brand') as HTMLAnchorElement;
    const logoImage = compiled.querySelector('.logo') as HTMLImageElement;

    expect(logoLink).toBeTruthy();
    expect(logoLink.getAttribute('routerLink')).toBe('/layout/mapa');
    expect(logoImage).toBeTruthy();
    expect(logoImage.getAttribute('src')).toBe('assets/images/imagen-presentacion.png');
    expect(logoImage.getAttribute('alt')).toBe('Logo');
  });

  it('debería mostrar el texto "Ruta disponible"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.querySelector('.logo-container span')?.textContent?.trim();
    expect(text).toBe('Ruta disponible');
  });

  it('debería contener un botón de cerrar sesión', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoutButton = compiled.querySelector('ion-button.toolbar-button') as HTMLElement;

    expect(logoutButton).toBeTruthy();
    expect(logoutButton.textContent?.trim()).toContain('Cerrar sesión');
  });

  it('debería llamar al método logout() al hacer clic en el botón de cerrar sesión', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoutButton = compiled.querySelector('ion-button.toolbar-button') as HTMLElement;

    logoutButton.click(); // Simula el clic en el botón
    fixture.detectChanges();

    expect(authServiceSpy.logout).toHaveBeenCalled(); // Verifica que el servicio haya sido llamado
  });
});
