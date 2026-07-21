export interface MqttSensorRecord {
  dataStreamId: string;
  result: string;
}

export interface MqttSensorPayload {
  sensorRecords: MqttSensorRecord[];
  resultTime: string;
}

export interface MqttControlTarget {
  taskId: number;
  taskingCapabilityId: number;
}

export interface MqttControlParameters {
  actionType: 'control' | 'auto';
  action: number;
}

export interface MqttControlPayload {
  targets: MqttControlTarget[];
  taskingParameters: MqttControlParameters;
  errorMessage?: string | null;
}
