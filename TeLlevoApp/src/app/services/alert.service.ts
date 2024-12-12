import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  // Alerta de éxito
  success(title: string, text: string, timer: number = 3000) {
    Swal.fire({
      icon: 'success',
      title,
      text,
      heightAuto: false,
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  // Alerta de error
  error(title: string, text: string) {
    Swal.fire({
      icon: 'error',
      title,
      text,
      heightAuto: false,
    });
  }

  // Alerta de advertencia
  warning(title: string, text: string) {
    Swal.fire({
      icon: 'warning',
      title,
      text,
      heightAuto: false,
    });
  }

  // Alerta informativa
  info(title: string, text: string) {
    Swal.fire({
      icon: 'info',
      title,
      text,
      heightAuto: false,
    });
  }

  // Alerta con confirmación
  confirm(title: string, text: string, confirmButtonText: string = 'Aceptar', cancelButtonText: string = 'Cancelar'): Promise<boolean> {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      heightAuto: false,
    }).then((result) => result.isConfirmed);
  }

  // Alerta personalizada
  customAlert(options: any) {
    Swal.fire({
      heightAuto: false,
      ...options,
    });
  }
}
