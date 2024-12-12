import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisViajesComponent } from '../app/pages/my-journeys/my-journeys.component';
import { IonicModule } from '@ionic/angular';
import { ViajeService } from 'src/app/services/journey.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

describe('MisViajesComponent (Standalone)', () => {
  let component: MisViajesComponent;
  let fixture: ComponentFixture<MisViajesComponent>;
  let viajeServiceSpy: jasmine.SpyObj<ViajeService>;

  // Mock de los datos de viajes
  const mockViajes = [
    {
      id: '1',
      nombreCreador: 'Conductor 1',
      email: 'conductor1@example.com',
      patente: 'ABC123',
      capacidad: 4,
      fechaCreacion: '2024-11-15T10:00:00Z',
      puntos: [{ lat: -33.45694, lng: -70.64827 }],
      conductor: 'conductor1@example.com', // El conductor coincide con emailUsuario
      pasajeros: ['user1@example.com'],
    },
    {
      id: '2',
      nombreCreador: 'Conductor 2',
      email: 'conductor2@example.com',
      patente: 'DEF456',
      capacidad: 3,
      fechaCreacion: '2024-11-16T10:00:00Z',
      puntos: [{ lat: -33.45694, lng: -70.64827 }],
      conductor: 'user2@example.com', // El conductor no coincide con emailUsuario
      pasajeros: ['user1@example.com'],
    },
  ];

  beforeEach(async () => {
    // Crear un espía para el servicio ViajeService
    viajeServiceSpy = jasmine.createSpyObj('ViajeService', ['getViajes', 'eliminarViaje', 'salirseDelViaje']);
    viajeServiceSpy.getViajes.and.returnValue(of(mockViajes));  // Mock de getViajes

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CommonModule, RouterModule, MisViajesComponent],
      providers: [{ provide: ViajeService, useValue: viajeServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MisViajesComponent);
    component = fixture.componentInstance;
    component.emailUsuario = 'conductor1@example.com'; // Mock del email del usuario actual
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar una lista de viajes', () => {
    component.misViajes = mockViajes; // Asignar datos mock a misViajes
    fixture.detectChanges(); // Asegura que Angular actualice el DOM

    const viajeCards = fixture.debugElement.queryAll(By.css('ion-card'));
    expect(viajeCards.length).toBe(2); // Verifica que haya dos viajes mostrados
  });

  it('debería mostrar los detalles correctos del viaje', () => {
    component.misViajes = mockViajes;
    fixture.detectChanges();

    const viajeCard = fixture.debugElement.query(By.css('ion-card'));
    const viajeContent = viajeCard.nativeElement.textContent;

    expect(viajeContent).toContain('Conductor 1');
    expect(viajeContent).toContain('Máximo: 4');
    expect(viajeContent).toContain('Patente: ABC123');
    expect(viajeContent).toContain('Pasajeros: user1@example.com');
  });

  it('debería mostrar un botón para "Eliminar viaje" si el usuario es el conductor', () => {
    component.emailUsuario = 'conductor1@example.com'; // El usuario es el conductor
    fixture.detectChanges();

    const eliminarBoton = fixture.debugElement.query(By.css('ion-button[color="danger"]'));
    expect(eliminarBoton).toBeTruthy(); // Verifica que el botón "Eliminar viaje" esté presente
    expect(eliminarBoton.nativeElement.textContent.trim()).toBe('Eliminar viaje');
  });

  it('debería mostrar un botón para "Salir del viaje" si el usuario es un pasajero', () => {
    component.emailUsuario = 'user1@example.com'; // El usuario es pasajero
    fixture.detectChanges();

    const salirBoton = fixture.debugElement.query(By.css('ion-button[color="warning"]'));
    expect(salirBoton).toBeTruthy();
    expect(salirBoton.nativeElement.textContent.trim()).toBe('Salir del viaje');
  });

  it('debería llamar al servicio para eliminar el viaje al hacer clic en "Eliminar viaje"', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.emailUsuario = 'conductor1@example.com';
    fixture.detectChanges();

    const eliminarBoton = fixture.debugElement.query(By.css('ion-button[color="danger"]'));
    eliminarBoton.triggerEventHandler('click', null);

    expect(viajeServiceSpy.eliminarViaje).toHaveBeenCalledWith('1');
  });

  it('debería llamar al servicio para salir del viaje al hacer clic en "Salir del viaje"', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.emailUsuario = 'user1@example.com';
    fixture.detectChanges();

    const salirBoton = fixture.debugElement.query(By.css('ion-button[color="warning"]'));
    salirBoton.triggerEventHandler('click', null);

    expect(viajeServiceSpy.salirseDelViaje).toHaveBeenCalledWith('1', 'user1@example.com');
  });
});
