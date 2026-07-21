import { db } from '../config/firebase';
import { TaskRecord } from '../types/firestore.types';
import { firestore } from 'firebase-admin';

export class TaskService {
  static async createTask(
    stationId: string, 
    targets: { taskId: number; taskingCapabilityId: number; }[], 
    taskingParameters: { actionType: string; action: number; },
    source: 'dashboard' | 'physical_button' = 'dashboard',
    status: 'pending' | 'confirmed' = 'pending'
  ): Promise<string> {
    const taskRef = db.collection('tasks').doc();
    const taskData: TaskRecord = {
      stationId,
      targets,
      taskingParameters,
      status,
      errorMessage: null,
      source,
      createdAt: firestore.Timestamp.now(),
      confirmedAt: status === 'confirmed' ? firestore.Timestamp.now() : null,
    };

    await taskRef.set(taskData);
    return taskRef.id;
  }

  static async confirmTasksByTaskIds(taskIds: number[], errorMessage: string | null = null): Promise<void> {
    // Queries all pending tasks that contain the received taskIds
    if (taskIds.length === 0) return;

    const tasksSnapshot = await db.collection('tasks')
      .where('status', '==', 'pending')
      .get();
      
    if (tasksSnapshot.empty) return;

    const batch = db.batch();
    let updatedCount = 0;

    tasksSnapshot.docs.forEach(doc => {
      const data = doc.data() as TaskRecord;
      const hasMatchingTask = data.targets.some(t => taskIds.includes(t.taskId));
      
      if (hasMatchingTask) {
        batch.update(doc.ref, {
          status: errorMessage ? 'failed' : 'confirmed',
          errorMessage: errorMessage || null,
          confirmedAt: firestore.Timestamp.now()
        });
        
        // Also update the relay states in station doc if confirmed
        if (!errorMessage) {
          data.targets.forEach(t => {
            const relayRef = db.collection('stations').doc(data.stationId).collection('relays').doc(t.taskingCapabilityId.toString());
            batch.set(relayRef, {
              actionType: data.taskingParameters.actionType,
              state: data.taskingParameters.action,
            }, { merge: true }); // Use merge in case name exists
          });
        }
        
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`Confirmed ${updatedCount} tasks in DB`);
    }
  }
}
