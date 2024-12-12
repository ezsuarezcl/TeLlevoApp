import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import {
  Firestore,
  CollectionReference,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from '@angular/fire/firestore';
import * as L from 'leaflet';
import { Journey } from 'src/app/interfaces/journey';

import { LoggingService } from './logging.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class JourneyService {
  private userCollection: CollectionReference;
  private journeyCollection = collection(this.firestore, 'journeys');

  constructor(
    private firestore: Firestore,
    private loggingService: LoggingService, // Servicio de logging
    private errorHandler: ErrorHandlerService // Servicio de manejo de errores
  ) {
    this.journeyCollection = collection(this.firestore, 'journeys');
    this.userCollection = collection(this.firestore, 'users');
  }

  // Obtener viajes en tiempo real
  getAllJourneys(): Observable<Journey[]> {
    return new Observable<Journey[]>((observer) => {
      const q = query(this.journeyCollection);
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const journeys = snapshot.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data(),
          })) as Journey[];
          observer.next(journeys);
        },
        (error) => observer.error(error)
      );

      // ¿¿Fugas de memoria? para investigar
      return () => unsubscribe();
    });
  }

  // Obtener viajes en tiempo real del usuario
  getUserJourneys(userEmail: string): Observable<Journey[]> {
    return new Observable<Journey[]>((observer) => {
      const unsubscribe = onSnapshot(
        this.journeyCollection,
        (snapshot) => {
          const journeys = snapshot.docs
            .map((doc) => ({ uid: doc.id, ...doc.data() } as Journey))
            .filter(
              (journey) =>
                journey.driver === userEmail ||
                (Array.isArray(journey.passengers) &&
                  journey.passengers.includes(userEmail))
            );

          observer.next(journeys);
        },
        (error) => observer.error(error)
      );

      return () => unsubscribe();
    });
  }

  // Crear un nuevo viaje
  createJourney(
    creatorEmail: string,
    carRegistration: string,
    capacity: number,
    routeCoordinates: L.LatLng[]
  ): Observable<Journey> {
    this.loggingService.log('Creando un viaje', {
      creatorEmail,
      carRegistration,
      capacity,
    });

    const userQuery = query(
      this.userCollection,
      where('email', '==', creatorEmail)
    );

    return from(getDocs(userQuery)).pipe(
      switchMap((querySnapshot) => {
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const nameCreator = userData['name'];

          // Filtrar puntos para reducir la densidad de coordenadas
          const filteredPoints = routeCoordinates.filter(
            (_, index) => index % 5 === 0
          );

          // Datos del viaje (sin incluir `uid`)
          const journeyData: Omit<Journey, 'uid'> = {
            nameCreator,
            email: creatorEmail,
            carRegistration,
            capacity,
            creationDate: new Date().toISOString(),
            points: filteredPoints.map((coord) => ({
              lat: coord.lat,
              lng: coord.lng,
            })),
            driver: creatorEmail,
            passengers: [],
          };

          this.loggingService.log('Datos del viaje creados', journeyData);

          // Crear el documento en Firestore
          return from(addDoc(this.journeyCollection, journeyData)).pipe(
            switchMap((docRef) => {
              // Actualizar el documento para incluir el UID
              const journeyWithUid = { ...journeyData, uid: docRef.id };
              return from(
                updateDoc(doc(this.journeyCollection, docRef.id), {
                  uid: docRef.id,
                })
              ).pipe(map(() => journeyWithUid));
            }),
            catchError((error) => {
              this.loggingService.error('Error al crear el viaje', error);
              return this.errorHandler.handleError(error);
            })
          );
        } else {
          this.loggingService.error(
            'No se encontró el usuario en la base de datos',
            {
              creatorEmail,
            }
          );
          return throwError(
            () => new Error('No se encontró el usuario en la base de datos.')
          );
        }
      })
    );
  }

  // Unirse a un viaje
  joinJourney(journeyId: string, passengerEmail: string): Observable<void> {
    this.loggingService.log('Intentando unirse al viaje', { journeyId, passengerEmail });

    const journeyDoc = doc(this.firestore, `journeys/${journeyId}`);

    return from(getDocs(query(this.journeyCollection, where('uid', '==', journeyId)))).pipe(
      map((snapshot) => {
        if (!snapshot.empty) {
          const journeyData = snapshot.docs[0].data() as Journey;

          this.loggingService.log('Viaje encontrado:', journeyData);

          if (journeyData.driver === passengerEmail) {
            this.loggingService.error('El conductor intentó unirse a su propio viaje.');
            throw new Error('No puedes unirte como pasajero a un viaje que tú conduces.');
          }

          if (journeyData.passengers.length >= journeyData.capacity) {
            this.loggingService.error('El viaje alcanzó su capacidad máxima.');
            throw new Error('El viaje ha alcanzado su capacidad máxima.');
          }

          return journeyDoc;
        } else {
          this.loggingService.error('El viaje no se encontró en la base de datos.');
          throw new Error('El viaje no se encontró en la base de datos.');
        }
      }),
      switchMap(() => updateDoc(journeyDoc, { passengers: arrayUnion(passengerEmail) })),
      tap(() => this.loggingService.log('El pasajero se unió al viaje', { journeyId, passengerEmail })),
      catchError((error) => {
        console.error('Error capturado en el servicio:', error); // Inspecciona el error aquí
        this.loggingService.error('Error al unirse al viajeAAA:', error);
        return throwError(() => error); // Asegura que se lanza el error original
      })
    );
  }

  // Eliminar un viaje
  deleteJourney(journeyId: string): Observable<void> {
    this.loggingService.log('Eliminando un viaje', { journeyId });

    const journeyDoc = doc(this.firestore, `journeys/${journeyId}`);
    return from(deleteDoc(journeyDoc)).pipe(
      tap(() => this.loggingService.log('Viaje eliminado', { journeyId })),
      catchError((error) => {
        this.loggingService.error('Error al eliminar el viaje', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Salirse de un viaje
  leaveJourney(journeyId: string, passengerEmail: string): Observable<void> {
    this.loggingService.log('Saliendo del viaje', {
      journeyId,
      passengerEmail,
    });

    const journeyDoc = doc(this.firestore, `journeys/${journeyId}`);
    return from(
      updateDoc(journeyDoc, { passengers: arrayRemove(passengerEmail) })
    ).pipe(
      tap(() =>
        this.loggingService.log('El pasajero salió del viaje', {
          journeyId,
          passengerEmail,
        })
      ),
      catchError((error) => {
        this.loggingService.error('Error al salir del viaje', error);
        return this.errorHandler.handleError(error);
      })
    );
  }
}
