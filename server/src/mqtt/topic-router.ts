import { handleSensorObservation } from './sensor.handler';

/**
 * Routes incoming MQTT messages to their appropriate handlers based on topic structure
 */
export const routeMqttMessage = (topic: string, message: Buffer) => {
  if (topic.startsWith('observation/sensor/')) {
    handleSensorObservation(topic, message);
  } else if (topic.startsWith('publish/station/')) {
    // TODO: Implement station confirm handler (Cụm 4 & 5)
    console.log(`[Control Confirm] Received message on ${topic} (Handler not yet implemented)`);
  } else {
    console.log(`Unhandled MQTT topic: ${topic}`);
  }
};
