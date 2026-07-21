import { firestore } from 'firebase-admin';

export interface DataStream {
  stationId: string;
  sensorType: string;
  unit: string;
  name: string;
}

export interface SensorLog {
  dataStreamId: string;
  stationId: string;
  value: number;
  unit: string;
  resultTime: firestore.Timestamp;
}
