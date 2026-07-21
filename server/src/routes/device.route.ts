import { Elysia, t } from 'elysia';
import { TaskService } from '../services/task.service';
import { MqttPublisher } from '../mqtt/publisher';
import { MqttControlPayload } from '../types/mqtt.types';

export const deviceRoute = new Elysia({ prefix: '/api/devices' })
  .post('/control', async ({ body, set }) => {
    try {
      const { stationId, targets, taskingParameters } = body;
      
      // 1. Create a pending Task in Firestore
      const docId = await TaskService.createTask(
        stationId, 
        targets, 
        taskingParameters, 
        'dashboard', 
        'pending'
      );
      
      // 2. Publish MQTT command to hardware
      const payload: MqttControlPayload = {
        targets,
        taskingParameters,
        errorMessage: null
      };
      
      await MqttPublisher.publishControlCommand(stationId, payload);
      
      set.status = 202; // Accepted
      return { 
        status: 'pending', 
        docId: docId, 
        message: 'Command sent to hardware, awaiting confirmation.' 
      };
      
    } catch (error: any) {
      set.status = 500;
      return { error: 'Failed to send control command', details: error.message };
    }
  }, {
    body: t.Object({
      stationId: t.String(),
      targets: t.Array(t.Object({
        taskId: t.Number(),
        taskingCapabilityId: t.Number()
      })),
      taskingParameters: t.Object({
        actionType: t.String(), // 'control' or 'auto'
        action: t.Number()      // 1 or 0
      })
    })
  });
