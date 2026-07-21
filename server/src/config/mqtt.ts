import mqtt from 'mqtt';
import { env } from './env';

const brokerUrl = `mqtt://${env.MQTT_HOST}:${env.MQTT_PORT}`;

export const mqttClient = mqtt.connect(brokerUrl);

mqttClient.on('connect', () => {
  console.log(`🔌 Connected to MQTT broker at ${brokerUrl}`);
  
  // Subscribe to required topics based on Architecture Doc
  mqttClient.subscribe('observation/sensor/#', (err) => {
    if (err) console.error('Failed to subscribe to sensor topic:', err);
    else console.log('📡 Subscribed to observation/sensor/+');
  });

  mqttClient.subscribe('publish/station/#', (err) => {
    if (err) console.error('Failed to subscribe to station confirm topic:', err);
    else console.log('📡 Subscribed to publish/station/+');
  });
});

mqttClient.on('error', (err) => {
  console.error('MQTT Error:', err);
});

mqttClient.on('message', (topic, message) => {
  const payloadStr = message.toString();
  console.log(`\n📩 Received MQTT on [${topic}]:\n${payloadStr}`);
  // TODO: Route messages to appropriate handlers
});
