import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  // Registro de información general
  log(message: string, data?: any) {
    if (!environment.production) {
      console.log(`INFO: ${message}`, data || '');
    }
  }

  // Registro de advertencias
  warn(message: string, data?: any) {
    if (!environment.production) {
      console.warn(`WARNING: ${message}`, data || '');
    }
  }

  // Registro de errores
  error(message: string, error?: any) {
    console.error(`ERROR: ${message}`, error || '');
  }

  // Registro crítico
  critical(message: string, data?: any) {
    console.error(`CRITICAL: ${message}`, data || '');
    if (environment.production) {
      this.reportCriticalError(message, data);
    }
  }

  // Método privado para reportar errores críticos (ejemplo)
  private reportCriticalError(message: string, data?: any) {
    console.log('Reportando error crítico:', { message, data });
  }
}
