import { MqttControlPayload } from '../types/mqtt.types';
import { TaskService } from '../services/task.service';
import { MqttPublisher } from './publisher';

export const handleStationConfirm = async (topic: string, message: Buffer) => {
  try {
    const payloadStr = message.toString();
    const payload = JSON.parse(payloadStr) as MqttControlPayload;
    
    if (!payload.targets || !payload.taskingParameters) {
      console.warn(`Invalid control confirm payload on ${topic}`);
      return;
    }

    // Extract stationId from topic (publish/station/{stationId})
    const topicParts = topic.split('/');
    const stationId = topicParts[topicParts.length - 1];
    
    const taskIds = payload.targets.map(t => t.taskId);

    console.log(`[Control Confirm] Received echo from ${stationId} for taskIds: ${taskIds.join(', ')}`);
    
    const updatedCount = await TaskService.confirmTasksByTaskIds(taskIds, payload.errorMessage);

    // Cụm 5: Physical Button Sync
    if (updatedCount === 0 && !payload.errorMessage) {
      console.log(`[Physical Button Sync] No pending tasks matched for ${stationId}. Syncing state...`);
      await TaskService.syncPhysicalButtonState(stationId, payload.targets, payload.taskingParameters);
      
      // Loop-back the exact payload to acknowledge to hardware
      await MqttPublisher.publishControlCommand(stationId, payload);
      console.log(`[Physical Button Sync] Loop-back ACK sent to ${stationId}`);
    }

  } catch (error) {
    console.error(`Error parsing station confirm payload on ${topic}:`, error);
  }
};
