import { mqttClient } from '../config/mqtt';
import { MqttControlPayload } from '../types/mqtt.types';

export class MqttPublisher {
  static async publishControlCommand(stationId: string, payload: MqttControlPayload): Promise<void> {
    const topic = `subscribe/station/${stationId}`;
    const message = JSON.stringify(payload);
    
    return new Promise((resolve, reject) => {
      mqttClient.publish(topic, message, { qos: 1 }, (error) => {
        if (error) {
          console.error(`Failed to publish to ${topic}`, error);
          reject(error);
        } else {
          console.log(`Published control command to ${topic}`);
          resolve();
        }
      });
    });
  }
}
