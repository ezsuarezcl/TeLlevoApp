import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ViajesComponent } from '../app/pages/journeys/journeys.component';
import { ViajeService } from '../app/services/journey.service'; // Ajustar el path si es necesario
import { Firestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Viaje } from '../app/interfaces/journey'; // Ajustar el path si es necesario

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

// Mock de ViajeService
class ViajeServiceMock {
  getViajes() {
    return of([
      {
        id: '1',
        nombreCreador: 'Juan Pérez',
        email: 'juan@example.com',
        patente: 'ABC123',
        capacidad: 4,
        fechaCreacion: '2024-11-15T10:00:00Z',
        puntos: [{ lat: -33.4489, lng: -70.6693 }],
        conductor: 'Juan Pérez',
        pasajeros: ['Pedro González', 'Ana Martínez'],
      },
      {
        id: '2',
        nombreCreador: 'María López',
        email: 'maria@example.com',
        patente: 'XYZ789',
        capacidad: 3,
        fechaCreacion: '2024-11-15T12:00:00Z',
        puntos: [{ lat: -33.4500, lng: -70.6650 }],
        conductor: 'María López',
        pasajeros: ['Luis Fernández'],
      },
    ] as Viaje[]);
  }
}

describe('ViajesComponent', () => {
  let component: ViajesComponent;
  let fixture: ComponentFixture<ViajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ViajesComponent, // Importar el componente standalone
      ],
      providers: [
        { provide: Firestore, useClass: FirestoreMock }, // Mock de Firestore
        { provide: ViajeService, useClass: ViajeServiceMock }, // Mock de ViajeService
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViajesComponent);
    component = fixture.componentInstance;

    // Cargar los viajes simulados desde el servicio
    component.viajes = [
      {
        id: '1',
        nombreCreador: 'Juan Pérez',
        email: 'juan@example.com',
        patente: 'ABC123',
        capacidad: 4,
        fechaCreacion: '2024-11-15T10:00:00Z',
        puntos: [{ lat: -33.4489, lng: -70.6693 }],
        conductor: 'Juan Pérez',
        pasajeros: ['Pedro González', 'Ana Martínez'],
      },
      {
        id: '2',
        nombreCreador: 'María López',
        email: 'maria@example.com',
        patente: 'XYZ789',
        capacidad: 3,
        fechaCreacion: '2024-11-15T12:00:00Z',
        puntos: [{ lat: -33.4500, lng: -70.6650 }],
        conductor: 'María López',
        pasajeros: ['Luis Fernández'],
      },
    ];

    fixture.detectChanges(); // Actualizar el DOM
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería renderizar correctamente la lista de viajes', () => {
    const elementosViaje = fixture.debugElement.queryAll(By.css('.viaje-item'));
    expect(elementosViaje.length).toBe(2); // Dos elementos simulados

    // Verificar contenido del primer viaje
    const primerViaje = elementosViaje[0].nativeElement;
    expect(primerViaje.textContent).toContain('Juan Pérez');
    expect(primerViaje.textContent).toContain('Máximo: 4');
    expect(primerViaje.textContent).toContain('ABC123');
  });

  it('debería llamar a "mostrarRuta" al hacer clic en un viaje', () => {
    spyOn(component, 'mostrarRuta'); // Espiar el método mostrarRuta

    const primerViaje = fixture.debugElement.query(By.css('.viaje-item'));
    primerViaje.triggerEventHandler('click', null); // Simular clic

    expect(component.mostrarRuta).toHaveBeenCalledWith(component.viajes[0]); // Verificar que se llamó con el viaje correcto
  });

  it('debería tener el atributo "aria-label" configurado correctamente', () => {
    const elementosViaje = fixture.debugElement.queryAll(By.css('.viaje-item'));
    expect(elementosViaje[0].attributes['aria-label']).toBe('Viaje de Juan Pérez');
    expect(elementosViaje[1].attributes['aria-label']).toBe('Viaje de María López');
  });

  it('debería renderizar la patente al final de cada item', () => {
    const elementosViaje = fixture.debugElement.queryAll(By.css('.viaje-patente'));
    expect(elementosViaje[0].nativeElement.textContent).toContain('ABC123');
    expect(elementosViaje[1].nativeElement.textContent).toContain('XYZ789');
  });
});
