import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { JourneyService } from '../../services/journey.service';
import { Journey } from 'src/app/interfaces/journey';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  selector: 'app-journeys',
  templateUrl: './journeys.component.html',
  styleUrls: ['./journeys.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class JourneysComponent implements OnInit {
  journeys: Journey[] = [];
  userEmail: string | null = localStorage.getItem('email');

  constructor(
    private journeyService: JourneyService,
    private alertService: AlertService,
    private loggingService: LoggingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadJourneys();
  }

  loadJourneys() {
    this.journeyService.getAllJourneys().subscribe({
      next: (data: Journey[]) => {
        this.journeys = data;
        console.log('Journeys loaded (real-time):', this.journeys);
      },
      error: (error) =>
        this.alertService.error(
          'Error al cargar los viajes',
          'Hubo un problema al cargar los viajes en tiempo real. Inténtalo de nuevo.'
        ),
    });
  }

  handleJoinJourneyError(error: any) {
    console.error('Error recibido en el componente:', error);

    const errorMessage = error instanceof Error ? error.message : error.toString();

    if (errorMessage === 'No puedes unirte como pasajero a un viaje que tú conduces.') {
      this.alertService.warning(
        'Acción no permitida',
        'El conductor no puede unirse como pasajero a su propio viaje.'
      );
    } else if (errorMessage === 'El viaje ha alcanzado su capacidad máxima.') {
      this.alertService.warning(
        'Viaje lleno',
        'El viaje ya ha alcanzado su capacidad máxima.'
      );
    } else if (errorMessage === 'El viaje no se encontró en la base de datos.') {
      this.alertService.warning(
        'Viaje no encontrado',
        'El viaje no existe o fue eliminado.'
      );
    } else {
      this.alertService.error(
        'Error al unirse al viaje',
        errorMessage || 'No se pudo unir al viaje. Inténtalo de nuevo.'
      );
    }
  }

  joinJourney(journey: Journey) {
    if (!this.userEmail) {
      this.alertService.warning(
        'No has iniciado sesión',
        'Por favor, inicia sesión para unirte al viaje.'
      );
      return;
    }

    this.journeyService.joinJourney(journey.uid, this.userEmail).subscribe({
      next: () => {
        this.alertService.success(
          'Te has unido al viaje',
          'Ahora puedes ver este viaje en "Mis viajes".'
        );
        this.router.navigate(['home/map'], { state: { ruta: journey.points } });
      },
      error: (error) => this.handleJoinJourneyError(error),
    });
  }

  showRoute(journey: Journey) {
    if (!this.userEmail) {
      this.alertService.warning(
        'No has iniciado sesión',
        'Por favor, inicia sesión para ver la ruta del viaje.'
      );
      return;
    }

    this.journeyService.joinJourney(journey.uid, this.userEmail).subscribe({
      next: () => {
        this.alertService.success(
          'Te has unido al viaje',
          'Ahora puedes ver este viaje en "Mis viajes".'
        );
        this.router.navigate(['home/map'], { state: { ruta: journey.points } });
      },
      error: (error) => this.handleJoinJourneyError(error),
    });
  }
}
