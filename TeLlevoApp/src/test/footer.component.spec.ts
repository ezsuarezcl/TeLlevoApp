import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

describe('FooterComponent (Standalone)', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FooterComponent, // Importa el componente directamente porque es standalone
        RouterTestingModule, // Simula el enrutamiento
        IonicModule.forRoot(), // Carga las dependencias de Ionic
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería contener un botón para navegar a "Viajes"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('ion-button[routerLink="/layout/viajes"]');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toBe('Viajes');
  });

  it('debería contener un botón para navegar a "Mis viajes"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('ion-button[routerLink="/layout/mis-viajes"]');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toBe('Mis viajes');
  });

  it('debería navegar a "/layout/viajes" al hacer clic en el botón "Viajes"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('ion-button[routerLink="/layout/viajes"]') as HTMLElement;
    expect(button.getAttribute('routerLink')).toBe('/layout/viajes');
  });

  it('debería navegar a "/layout/mis-viajes" al hacer clic en el botón "Mis viajes"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('ion-button[routerLink="/layout/mis-viajes"]') as HTMLElement;
    expect(button.getAttribute('routerLink')).toBe('/layout/mis-viajes');
  });
});
