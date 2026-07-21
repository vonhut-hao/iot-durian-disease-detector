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

export interface TaskRecord {
  stationId: string;
  targets: { taskId: number; taskingCapabilityId: number; }[];
  taskingParameters: { actionType: string; action: number; };
  status: 'pending' | 'confirmed' | 'failed' | 'timeout';
  errorMessage: string | null;
  source: 'dashboard' | 'physical_button';
  createdAt: firestore.Timestamp;
  confirmedAt: firestore.Timestamp | null;
}
