import { Injectable } from '@angular/core';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';

import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from '@angular/fire/auth';

import { LoggingService } from './logging.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState = new BehaviorSubject<boolean>(false);

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private loggingService: LoggingService,
    private errorHandler: ErrorHandlerService
  ) {
    // Reactivamente maneja el estado de autenticación
    this.auth.onAuthStateChanged((user) => {
      this.authState.next(!!user);
      this.loggingService.log('Estado de autenticación actualizado', { isAuth: !!user });
    });
  }

  // Método para iniciar sesión
  login(email: string, password: string): Observable<boolean> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) =>
        userCredential.user.getIdToken().then((token) => {
          this.saveToken(token, email);
          return true;
        })
      ),
      catchError((error) => {
        this.loggingService.error('Error al iniciar sesión', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Método para crear una cuenta
  register(name: string, email: string, password: string): Observable<any> {
    this.loggingService.log('Intentando registrar usuario', { email });
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        const userRef = collection(this.firestore, 'users');
        const userData = {
          uid: userCredential.user.uid,
          name,
          email,
          dateRegister: new Date().toISOString(),
        };
        this.loggingService.log('Usuario creado en Firebase', { uid: userCredential.user.uid });

        return from(addDoc(userRef, userData)).pipe(
          tap(() => this.loggingService.log('Datos guardados en Firestore', userData)),
          map(() => userData)
        );
      }),
      catchError((error) => {
        this.loggingService.error('Error al registrar usuario', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Método para recuperar contraseña
  passwordRestore(correo: string): Observable<void> {
    if (!this.isValidEmail(correo)) {
      return this.errorHandler.handleError(new Error('Formato de correo no válido'));
    }

    this.loggingService.log('Intentando enviar correo de recuperación', { email: correo });
    return from(sendPasswordResetEmail(this.auth, correo)).pipe(
      tap(() => this.loggingService.log('Correo de recuperación enviado', { email: correo })),
      catchError((error) => {
        this.loggingService.error('Error al enviar correo de recuperación', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Método para cerrar sesión
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => this.clearToken()),
      catchError((error) => {
        this.loggingService.error('Error al cerrar sesión', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Método para saber si el usuario está autenticado
  isAuth(): Observable<boolean> {
    return this.authState.asObservable();
  }

  // Utilidades privadas para manejo del token
  private saveToken(token: string, email: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('email', email);
    this.loggingService.log('Token guardado en localStorage', { token });
  }

  private clearToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('email');
    this.loggingService.log('Token eliminado de localStorage');
  }

  // Validación de correo electrónico
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
