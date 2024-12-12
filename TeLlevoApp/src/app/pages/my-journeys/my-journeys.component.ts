import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { JourneyService } from '../../services/journey.service';
import { Journey } from 'src/app/interfaces/journey';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../services/alert.service';

import QRCode from 'qrcode';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-journeys',
  templateUrl: './my-journeys.component.html',
  styleUrls: ['./my-journeys.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class MyJourneysComponent implements OnInit {
  myJourneys: Journey[] = [];
  userEmail: string | null = localStorage.getItem('email');

  constructor(private journeyService: JourneyService, private alertService: AlertService) {}

  ngOnInit() {
    this.loadJourneys();
  }

  private loadJourneys() {
    if (!this.userEmail) {
      this.alertService.warning(
        'Advertencia',
        'No se encontró la información del usuario. Por favor, inicia sesión nuevamente.'
      );
      return;
    }

    this.journeyService.getUserJourneys(this.userEmail).subscribe({
      next: (data: Journey[]) => {
        this.myJourneys = data;
        console.log('Mis viajes (en tiempo real):', this.myJourneys);
      },
      error: () =>
        this.alertService.error(
          'Vaya!',
          'Parece que no eres parte de ningun viaje.'
        ),
    });
  }

  deleteJourney(journeyId: string) {
    this.alertService.confirm(
      '¿Estás seguro?',
      'Esta acción eliminará el viaje de manera permanente.',
      'Sí, eliminar',
      'Cancelar'
    ).then((result) => {
      if (result) {
        this.journeyService.deleteJourney(journeyId).subscribe({
          next: () => {
            this.alertService.success('Viaje eliminado', 'El viaje ha sido eliminado exitosamente.');
            this.myJourneys = this.myJourneys.filter((journey) => journey.uid !== journeyId);
          },
          error: () =>
            this.alertService.error(
              'Error al eliminar el viaje',
              'No se pudo eliminar el viaje. Inténtalo de nuevo.'
            ),
        });
      }
    });
  }

  leaveJourney(journeyId: string) {
    if (!this.userEmail) {
      return;
    }

    this.alertService.confirm(
      '¿Estás seguro?',
      '¿Deseas salir de este viaje?',
      'Sí, salir',
      'Cancelar'
    ).then((result) => {
      if (result) {
        this.journeyService.leaveJourney(journeyId, this.userEmail).subscribe({
          next: () => {
            this.alertService.success('Te has salido del viaje', 'Has salido del viaje exitosamente.');
            this.myJourneys = this.myJourneys.filter((journey) => journey.uid !== journeyId);
          },
          error: () =>
            this.alertService.error(
              'Error al salir del viaje',
              'No se pudo salir del viaje. Inténtalo de nuevo.'
            ),
        });
      }
    });
  }

  showQRCode(journeyUid: string) {
    QRCode.toDataURL(journeyUid, { width: 200, height: 200 })
      .then((url) => {
        Swal.fire({
          title: 'Código QR del Viaje',
          html: `<img src="${url}" alt="Código QR" style="width: 200px; height: 200px;">`,
          confirmButtonText: 'Cerrar',
          heightAuto: false,
        });
      })
      .catch((err) => {
        console.error('Error al generar el código QR:', err);
        this.alertService.error('Error', 'No se pudo generar el código QR.');
      });
  }
}
