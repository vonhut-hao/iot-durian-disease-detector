import { db } from '../config/firebase';
import { MqttSensorPayload } from '../types/mqtt.types';
import { DataStream, SensorLog } from '../types/firestore.types';
import { Timestamp } from 'firebase-admin/firestore';

export class SensorService {
  /**
   * Parse the sensor payload and write to Firestore
   * Payload format: { sensorRecords: [{ dataStreamId, result }], resultTime }
   */
  static async processSensorTelemetry(payload: MqttSensorPayload): Promise<void> {
    const { sensorRecords, resultTime } = payload;

    if (!sensorRecords || !Array.isArray(sensorRecords)) {
      console.warn('Invalid sensor payload: Missing sensorRecords array');
      return;
    }

    const resultTimestamp = Timestamp.fromDate(new Date(resultTime));
    const batch = db.batch();

    // Use a simple in-memory cache for data streams to avoid N+1 queries
    // In a real production app, this could be moved outside the function or use Redis
    const streamCache = new Map<string, string>();

    for (const record of sensorRecords) {
      const { dataStreamId, result } = record;

      if (!dataStreamId || !result) continue;

      // 1. Separate value and unit (e.g., "31.5oC" -> value: 31.5, unit: "oC")
      // Regex matches optional +/- then digits/decimals followed by any string
      const match = result.match(/^([+-]?[\d.]+)(.*)$/);
      let value = 0;
      let unit = '';

      if (match) {
        value = parseFloat(match[1]);
        unit = match[2].trim();
      } else {
        console.warn(`Could not parse result format: ${result}`);
        continue;
      }

      // 2. Fetch dataStream info to get stationId with Caching
      let stationId = streamCache.get(dataStreamId) || 'unknown';

      if (stationId === 'unknown') {
        const streamDoc = await db.collection('data_streams').doc(dataStreamId).get();
        if (streamDoc.exists) {
          const streamData = streamDoc.data() as DataStream;
          stationId = streamData.stationId;
          streamCache.set(dataStreamId, stationId);
        } else {
          console.warn(`Unknown dataStreamId: ${dataStreamId}. Assigning stationId = 'unknown'`);
        }
      }

      // 3. Prepare document for sensor_logs
      const logRef = db.collection('sensor_logs').doc();
      const logData: SensorLog = {
        dataStreamId,
        stationId,
        value,
        unit,
        resultTime: resultTimestamp,
      };

      batch.set(logRef, logData);
    }

    // Commit all writes in a single batch
    try {
      await batch.commit();
      console.log(`Saved ${sensorRecords.length} sensor logs to Firestore`);
    } catch (error) {
      console.error('Failed to commit sensor logs to Firestore:', error);
    }
  }
}
