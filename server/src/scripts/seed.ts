import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize firebase admin directly here for the seed script
import serviceAccount from '../../firebase-service-account.json';

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any)
  });
}

const db = getFirestore();

async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  
  // 1. Create a mock Station
  const stationId = 'station-01';
  const stationRef = db.collection('stations').doc(stationId);
  await stationRef.set({
    name: 'Trạm vườn Lô A',
    location: '10.029939, 105.770615' // CTU coords
  });
  
  // Setup relays for station
  await stationRef.collection('relays').doc('6').set({
    name: 'Van tưới 1',
    state: 0,
    actionType: 'control'
  });
  console.log(`✅ Created Station: ${stationId}`);

  // 2. Create mock Data Streams
  const streams = [
    { id: '2', sensorType: 'temperature', unit: 'oC', name: 'Nhiệt kế DHT22' },
    { id: '3', sensorType: 'humidity', unit: '%rH', name: 'Ẩm kế DHT22' },
    { id: '4', sensorType: 'soil_moisture', unit: '%', name: 'Cảm biến ẩm đất' }
  ];
  
  for (const stream of streams) {
    await db.collection('data_streams').doc(stream.id).set({
      stationId,
      sensorType: stream.sensorType,
      unit: stream.unit,
      name: stream.name
    });
  }
  console.log(`✅ Created ${streams.length} Data Streams`);

  // 3. Create mock Trees
  const trees = [
    { id: 'T-001', name: 'Sầu Riêng Ri6 #01', variety: 'Ri6', row: 'A', notes: 'Cây khỏe, tán rộng', stationId },
    { id: 'T-002', name: 'Sầu Riêng Ri6 #02', variety: 'Ri6', row: 'A', notes: 'Đang ra trái bói', stationId },
    { id: 'T-003', name: 'Sầu Riêng Monthong #01', variety: 'Monthong', row: 'B', notes: 'Cần bón thêm phân', stationId },
  ];

  for (const tree of trees) {
    const { id, ...treeData } = tree;
    await db.collection('trees').doc(id).set({
      ...treeData,
      plantedDate: Timestamp.fromDate(new Date('2022-05-10'))
    });
  }
  console.log(`✅ Created ${trees.length} Trees`);
  
  // 4. Create some initial sensor logs
  const batch = db.batch();
  for (const stream of streams) {
    const logRef = db.collection('sensor_logs').doc();
    batch.set(logRef, {
      dataStreamId: stream.id,
      stationId,
      value: stream.sensorType === 'temperature' ? 31.5 : (stream.sensorType === 'humidity' ? 78.2 : 65.0),
      unit: stream.unit,
      resultTime: Timestamp.now()
    });
  }
  await batch.commit();
  console.log(`✅ Created initial sensor logs`);

  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seedDatabase().catch(console.error);
