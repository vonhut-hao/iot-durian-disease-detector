import { MqttSensorPayload } from '../types/mqtt.types';
import { SensorService } from '../services/sensor.service';

export const handleSensorObservation = async (topic: string, message: Buffer) => {
  try {
    const payloadStr = message.toString();
    const payload = JSON.parse(payloadStr) as MqttSensorPayload;

    // Validate basic structure
    if (!payload.sensorRecords || !payload.resultTime) {
      console.warn(`Invalid sensor payload structure on topic ${topic}`);
      return;
    }

    console.log(`[Telemetry] Received ${payload.sensorRecords.length} records on ${topic}`);

    // Process and save to DB
    await SensorService.processSensorTelemetry(payload);

  } catch (error) {
    console.error(`Error parsing sensor payload on ${topic}:`, error);
  }
};
