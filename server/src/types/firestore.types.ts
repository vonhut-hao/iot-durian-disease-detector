import { Timestamp } from 'firebase-admin/firestore';

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
  resultTime: Timestamp;
}

export interface TaskRecord {
  stationId: string;
  targets: { taskId: number; taskingCapabilityId: number; }[];
  taskingParameters: { actionType: string; action: number; };
  status: 'pending' | 'confirmed' | 'failed' | 'timeout';
  errorMessage: string | null;
  source: 'dashboard' | 'physical_button';
  createdAt: Timestamp;
  confirmedAt: Timestamp | null;
}

export interface Tree {
  id: string; // The treeId, e.g., 'T-001'
  name: string;
  variety: string;
  plantedDate: Timestamp;
  stationId: string;
  row: string;
  notes: string;
}

export interface Station {
  id: string;
  name: string;
  location?: string;
  // relays will be a subcollection in firestore
}
