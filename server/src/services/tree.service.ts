import { db } from '../config/firebase';
import { Tree, Station, SensorLog, DataStream } from '../types/firestore.types';

export class TreeService {
  static async getTreeDetails(treeId: string) {
    // 1. Fetch Tree document
    const treeDoc = await db.collection('trees').doc(treeId).get();
    if (!treeDoc.exists) {
      return null;
    }
    const treeData = treeDoc.data() as Tree;
    treeData.id = treeDoc.id; // ensure ID is included

    // 2. Fetch associated Station document
    let stationData: Station | null = null;
    let relays: any[] = [];
    if (treeData.stationId) {
      const stationDoc = await db.collection('stations').doc(treeData.stationId).get();
      if (stationDoc.exists) {
        stationData = stationDoc.data() as Station;
        stationData.id = stationDoc.id;
        
        // Fetch relays subcollection
        const relaysSnapshot = await db.collection('stations').doc(treeData.stationId).collection('relays').get();
        relays = relaysSnapshot.docs.map(doc => ({
          taskingCapabilityId: doc.id,
          ...doc.data()
        }));
      }
    }

    // 3. Fetch latest sensor logs for the station
    // To do this efficiently, we could fetch the most recent log per dataStreamId for this station
    // Alternatively, we just fetch the last N logs for the station.
    let latestSensors: any[] = [];
    if (treeData.stationId) {
      const sensorsSnapshot = await db.collection('sensor_logs')
        .where('stationId', '==', treeData.stationId)
        .orderBy('resultTime', 'desc')
        .limit(10) // fetch latest 10 logs
        .get();

      // Deduplicate by dataStreamId to just get the "latest" for each sensor type
      const sensorMap = new Map<string, any>();
      sensorsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!sensorMap.has(data.dataStreamId)) {
          sensorMap.set(data.dataStreamId, data);
        }
      });
      
      latestSensors = Array.from(sensorMap.values());
    }

    return {
      ...treeData,
      station: stationData ? { ...stationData, relays } : null,
      latestSensors
    };
  }
}
