import { handleSensorObservation } from './sensor.handler';
import { handleStationConfirm } from './station-confirm.handler';

/**
 * Routes incoming MQTT messages to their appropriate handlers based on topic structure
 */
export const routeMqttMessage = (topic: string, message: Buffer) => {
  if (topic.startsWith('observation/sensor/')) {
    handleSensorObservation(topic, message);
  } else if (topic.startsWith('publish/station/')) {
    handleStationConfirm(topic, message);
  } else {
    console.log(`Unhandled MQTT topic: ${topic}`);
  }
};
