export interface Journey {
  uid: string;
  nameCreator: string;
  email: string;
  carRegistration: string;
  capacity: number;
  creationDate: string;
  points: { lat: number; lng: number }[];
  driver: string;
  passengers: string[];
}
