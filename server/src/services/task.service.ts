import { db } from '../config/firebase';
import { TaskRecord } from '../types/firestore.types';
import { Timestamp } from 'firebase-admin/firestore';

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
      createdAt: Timestamp.now(),
      confirmedAt: status === 'confirmed' ? Timestamp.now() : null,
    };

    await taskRef.set(taskData);
    return taskRef.id;
  }

  static async confirmTasksByTaskIds(taskIds: number[], errorMessage: string | null = null): Promise<number> {
    if (taskIds.length === 0) return 0;

    const tasksSnapshot = await db.collection('tasks')
      .where('status', '==', 'pending')
      .get();
      
    if (tasksSnapshot.empty) return 0;

    const batch = db.batch();
    let updatedCount = 0;

    tasksSnapshot.docs.forEach(doc => {
      const data = doc.data() as TaskRecord;
      const hasMatchingTask = data.targets.some(t => taskIds.includes(t.taskId));
      
      if (hasMatchingTask) {
        batch.update(doc.ref, {
          status: errorMessage ? 'failed' : 'confirmed',
          errorMessage: errorMessage || null,
          confirmedAt: Timestamp.now()
        });
        
        if (!errorMessage) {
          data.targets.forEach(t => {
            const relayRef = db.collection('stations').doc(data.stationId).collection('relays').doc(t.taskingCapabilityId.toString());
            batch.set(relayRef, {
              actionType: data.taskingParameters.actionType,
              state: data.taskingParameters.action,
            }, { merge: true });
          });
        }
        
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`Confirmed ${updatedCount} tasks in DB`);
    }
    
    return updatedCount;
  }

  static async syncPhysicalButtonState(
    stationId: string,
    targets: { taskId: number; taskingCapabilityId: number; }[],
    taskingParameters: { actionType: string; action: number; }
  ): Promise<void> {
    // 1. Create a confirmed task with source physical_button
    await this.createTask(stationId, targets, taskingParameters, 'physical_button', 'confirmed');

    // 2. Update relays in stations collection
    const batch = db.batch();
    targets.forEach(t => {
      const relayRef = db.collection('stations').doc(stationId).collection('relays').doc(t.taskingCapabilityId.toString());
      batch.set(relayRef, {
        actionType: taskingParameters.actionType,
        state: taskingParameters.action,
      }, { merge: true });
    });
    
    await batch.commit();
    console.log(`Synced physical button state for station ${stationId}`);
  }
}
