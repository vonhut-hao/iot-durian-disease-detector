export interface MqttSensorRecord {
  dataStreamId: string;
  result: string;
}

export interface MqttSensorPayload {
  sensorRecords: MqttSensorRecord[];
  resultTime: string;
}
