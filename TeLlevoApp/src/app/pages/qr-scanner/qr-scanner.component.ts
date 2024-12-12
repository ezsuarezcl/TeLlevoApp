import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { JourneyService } from '../../services/journey.service';
import { AlertService } from '../../services/alert.service';
import { NgxScannerQrcodeModule, LOAD_WASM } from 'ngx-scanner-qrcode';
import { Camera } from '@capacitor/camera';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  standalone: true,
  imports: [IonicModule, NgxScannerQrcodeModule, CommonModule],
})
export class QrScannerComponent implements OnInit {
  constructor(
    private journeyService: JourneyService,
    private alertService: AlertService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      await this.checkCameraPermission();

      await this.loadWasmFile();

    } catch (err) {
      this.alertService.error('Error en la inicialización del componente:', err);

      // Mostrar error específico al usuario
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      this.alertService.error('Error crítico', `No se pudo inicializar el escáner de QR: ${errorMessage}`);
    }
  }

  // Método para gestionar permisos de cámara
  async checkCameraPermission() {
    try {
      const status = await Camera.requestPermissions();
      if (status.camera !== 'granted') {
        throw new Error('Permiso de cámara denegado');
      }
    } catch (err) {
      throw new Error('No se pudo verificar los permisos de la cámara: ' + err.message);
    }
  }

  // Método para cargar el archivo WASM
  async loadWasmFile() {
    return new Promise((resolve, reject) => {
      LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe({
        next: () => resolve(true),
        error: (err) => reject(new Error('No se pudo cargar el archivo WASM: ' + err.message)),
      });
    });
  }

  onScanSuccess(qrCodeValue: string) {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      this.alertService.warning('No has iniciado sesión', 'Por favor, inicia sesión antes de escanear.');
      return;
    }

    this.journeyService.joinJourney(qrCodeValue, userEmail).subscribe({
      next: () => {
        this.alertService.success('Unido al viaje', 'Te has unido exitosamente al viaje.');
        this.router.navigate(['/home/my-journeys']);
      },
      error: (error) => {
        console.error('Error al unirse al viaje:', error);

        const errorMessage = error.error?.message || error.message || error.toString();

        switch (errorMessage) {
          case 'No puedes unirte como pasajero a un viaje que tú conduces.':
            this.alertService.warning('Acción no permitida', 'No puedes unirte como pasajero a un viaje que tú conduces.');
            break;
          case 'El viaje ha alcanzado su capacidad máxima.':
            this.alertService.warning('Viaje lleno', 'El viaje ya ha alcanzado su capacidad máxima.');
            break;
          case 'El viaje no se encontró en la base de datos.':
            this.alertService.warning('Viaje no encontrado', 'El viaje no existe o fue eliminado.');
            break;
          default:
            this.alertService.error('Error desconocido', 'Ocurrió un error inesperado al unirse al viaje.');
            break;
        }
      },
    });
  }
}
