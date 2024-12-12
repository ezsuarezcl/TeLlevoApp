import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { JourneyService } from '../../services/journey.service';
import { NgxLeafletLocateModule } from '@runette/ngx-leaflet-locate';
import { ControlPosition } from 'leaflet';
import { RouterModule } from '@angular/router';

import 'leaflet-routing-machine';
import { AlertService } from 'src/app/services/alert.service';

L.Icon.Default.imagePath = 'assets/leaflet/';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, CommonModule, RouterModule, NgxLeafletLocateModule],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  map!: L.Map;
  routing!: any;
  routeCoordinates: L.LatLng[] = [];
  formDatosAuto: FormGroup;

  locateOptions = {
    position: 'topright' as ControlPosition,
    flyTo: true,
    setView: 'once',
    strings: {
      title: 'Ver mi ubicación',
    },
  };

  constructor(
    private fb: FormBuilder,
    private journeyService: JourneyService,
    private alertService: AlertService
  ) {
    this.formDatosAuto = this.fb.group({
      patente: ['', Validators.required],
      capacidad: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngAfterViewInit() {
    this.initMap();
    this.initRouting();

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    const state = history.state;
    if (state && state.ruta) {
      this.showRouteOnMap(state.ruta);
    }
  }

  private initMap() {
    this.map = L.map('map').setView([-33.45694, -70.64827], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
  }

  private initRouting() {
    this.routing = L.Routing.control({
      waypoints: [L.latLng(-33.5774613, -70.7110774), L.latLng(-33.5979652, -70.7060795)],
      show: false,
      routeWhileDragging: true,
    }).addTo(this.map);

    this.routing.on('routesfound', (e) => {
      const route = e.routes[0];
      this.routeCoordinates = route.coordinates;
      console.log('Ruta encontrada:', this.routeCoordinates);
    });
  }

  createJourney() {
    if (this.routeCoordinates.length > 0 && this.formDatosAuto.valid) {
      const emailCreador = localStorage.getItem('email');
      if (!emailCreador) {
        this.alertService.error(
          'Error',
          'No se encontró la información del usuario. Por favor, inicia sesión de nuevo.'
        );
        return;
      }

      const { patente, capacidad } = this.formDatosAuto.value;

      this.journeyService.createJourney(emailCreador, patente, capacidad, this.routeCoordinates).subscribe(
        (createdJourney) => {
          console.log('Viaje creado con UID:', createdJourney.uid);
          this.alertService.success('Viaje creado', 'El viaje se ha guardado exitosamente.');
          this.formDatosAuto.reset();
        },
        (error) => {
          console.error('Error al guardar el viaje:', error);
          this.alertService.error(
            'Error',
            error.message || 'No se pudo guardar el viaje. Inténtalo de nuevo.'
          );
        }
      );
    } else {
      this.alertService.warning('Sin ruta', 'No se ha encontrado una ruta para guardar o el formulario es inválido.');
    }
  }

  showRouteOnMap(puntos: { lat: number; lng: number }[]) {
    if (!this.map) {
      console.error('El mapa no está inicializado.');
      return;
    }

    if (this.routing) {
      try {
        this.routing.getPlan().setWaypoints([]);
        this.map.removeControl(this.routing);
      } catch (error) {
        console.warn('Error al intentar eliminar el control de ruta existente:', error);
      }
    }

    if (puntos.length >= 3) {
      const puntosSeleccionados = [
        puntos[0],
        puntos[Math.floor(puntos.length / 2)],
        puntos[puntos.length - 1],
      ];

      try {
        this.routing = L.Routing.control({
          waypoints: puntosSeleccionados.map((punto) => L.latLng(punto.lat, punto.lng)),
          routeWhileDragging: true,
          show: true,
        }).addTo(this.map);
      } catch (error) {
        console.error('Error al mostrar la ruta en el mapa:', error);
      }
    } else {
      console.warn('No se encontraron suficientes puntos para mostrar una ruta simplificada.');
    }
  }

  onLocationFound(event: any) {
    console.log('Ubicación encontrada:', event);
    // Puedes manejar la ubicación, centrar el mapa o mostrar un marcador.
  }

  ngOnDestroy(): void {
    this.map.remove();
    console.log('Mapa eliminado.');
  }
}
