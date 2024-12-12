import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private loggingService: LoggingService) {}

  handleError(error: any) {
    // Registro del error en el sistema de logging
    this.loggingService.error('Error detectado:', error);

    // Preservar mensajes de error específicos
    if (error instanceof Error) {
      return throwError(() => error);
    }

    // Manejo de errores de Firebase
    if (error.code) {
      switch (error.code) {
        case 'auth/wrong-password':
          return throwError(() => new Error('La contraseña es incorrecta.'));
        case 'auth/user-not-found':
          return throwError(() => new Error('No se encontró un usuario con ese correo.'));
        case 'auth/email-already-in-use':
          return throwError(() => new Error('El correo ya está en uso.'));
        default:
          return throwError(() => new Error('Ocurrió un error inesperado. Inténtalo de nuevo.'));
      }
    }

    // Manejo de errores HTTP
    if (error.status) {
      switch (error.status) {
        case 400:
          return throwError(() => new Error('Solicitud incorrecta. Verifica los datos enviados.'));
        case 404:
          return throwError(() => new Error('El recurso solicitado no se encontró.'));
        case 500:
          return throwError(() => new Error('Error interno del servidor. Inténtalo más tarde.'));
        default:
          return throwError(() => new Error(`Error inesperado: ${error.statusText || error.message}`));
      }
    }

    // Error genérico
    return throwError(() => new Error('Error desconocido. Por favor, inténtalo de nuevo.'));
  }
}
