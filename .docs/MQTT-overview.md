# MQTT CONFIGURATION

## Broker Connection Configuration:
Sử dụng MQTT broker bên thứ 3 free, với thông số cấu hình như sau:

*   **Mqtt broker Host-ip**: `null`
*   **Mqtt broker Host-domain**: `broker.hivemq.com`
*   **User mqtt**: `null`
*   **pass**: `null`
*   **Port mqtt**: `1883`

---

## Hardware publish:

Dùng để thiết bị phần cứng gửi lên server các cấu hình về kích mở van hay motor bơm

**Topic:** `subscribe/station/{stationId}`
**Message:**
```json
{
  "targets": [
    { "taskId": "<Long>", "taskingCapabilityId": "<Long>" },
    { "taskId": "<Long>", "taskingCapabilityId": "<Long>" },
    { "taskId": "<Long>", "taskingCapabilityId": "<Long>" }
  ],
  "taskingParameters": {
    "action": "<String>",
    "<additionalKey>": "<value>"
  },
  "errorMessage": "<String|null>"
}

```

**Description:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| taskingCapabilityId | Long | Yes | Identifies which actuator to control. Route to the actuator whose DB ID matches this value. Absent in batch-target messages. |
| taskId | Long | Yes | Unique Task ID. Echo back unchanged in the result — the server uses it to update the correct DB record. Absent in batch-target messages. |
| targets | Array | Yes | List of { taskId, taskingCapabilityId } pairs. Each entry must be processed as a separate command. Absent in single-target messages. |
| taskingParameters | Object | Yes | The command payload. Contains "action" key plus any actuator-specific keys. Shared across all targets in a batch message. |
| errorMessage | String | null | No | Error from a prior attempt. null for a fresh task. Hardware may use it for context but does not need to act on it. Omitted from JSON when null. |

**Example:**

```json
// ------------------ Control valve ------------------ //
{
  "targets": [
    { "taskId": 102, "taskingCapabilityId": 6 }
  ],
  "taskingParameters": {
    "actionType": "control",
    "action": 1 // (Or 0)
  }
}
{
  "targets": [
    { "taskId": 102, "taskingCapabilityId": 6 },
    { "taskId": 103, "taskingCapabilityId": 7 }
  ],
  "taskingParameters": {
    "actionType": "control",
    "action": 1 // (Or 0)
  }
}
{
  "targets": [
    { "taskId": 102, "taskingCapabilityId": 6 },
    { "taskId": 103, "taskingCapabilityId": 7 },
    { "taskId": 104, "taskingCapabilityId": 8 }
  ],
  "taskingParameters": {
    "actionType": "control",
    "action": 1 // (Or 0)
  }
}

// ------------------ Automation mode ------------------ //
{
  "targets": [
    { "taskId": 101, "taskingCapabilityId": 5 },
    { "taskId": 102, "taskingCapabilityId": 6 }
  ],
  "taskingParameters": {
    "actionType": "auto",
    "action": 1 // (Or 0)
  }
}

// taskId chỉ hành động của lệnh đó và các task ID đều là riêng biệt không trùng nhau giữa các taskingCapability
// VD: taskID : 102 là bật relay của taskingCapabilityID 6
// taskID : 104 là bật relay của taskingCapabilityID 7
// taskingCapability chỉ các thiết bị được lắp như relay 1, relay 2, motor bơm
// VD: taskingCapabilityID: 6 là ID của relay 1
// taskingCapabilityID: 7 là ID của relay 2
// actionType chỉ loại lệnh bạn muốn cấu hình như cấu hình chế độ auto, cấu hình chế độ control (manual)
// action là trạng thái của thiết bị mà bạn muốn cấu hình cho nó

```

---

## Hardware subcribe:

Dùng để thiết bị phần cứng nhận về từ server các cấu hình về kích mở van hay motor bơm

**Topic:** `publish/station/{stationId}`
**Message:**

```json
{
  "targets": [
    { "taskId": "<Long>", "taskingCapabilityId": "<Long>" },
    { "taskId": "<Long>", "taskingCapabilityId": "<Long>" }
  ],
  "taskingParameters": {
    "action": "<String>",
    "<additionalKey>": "<value>"
  },
  "errorMessage": "<String|null>"
}

```

**Description:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| taskingCapabilityId | Long | Yes | Echo back from the command. Identifies which actuator produced this result. Required for "auto" / "auto-set" side effects. Absent in batch-target messages. |
| taskId | Long | Yes | Critical — must match the taskId from the received command exactly. The server looks up the Task row by this ID. Wrong or missing → NotFoundException logged, no DB update. Absent in batch-target messages. |
| targets | Array | Yes | List of { taskId, taskingCapabilityId } pairs echoed back from the batch command. Absent in single-target messages. |
| taskingParameters | Object | Yes | Enriched result payload after execution. Start from the original params and add real-world outcome data: actual position, final state, sensor readings, etc. Always add a "timestamp" (Unix epoch ms). Server stores this wholesale for the task. |
| errorMessage | String | null | No | null → success. Human-readable string → failure reason. Omit entirely on success — the server tolerates absence (treats as null). |

---

## Publish from Hardware:

Dành cho phần cứng gửi dữ liệu cảm biến lên Server 15 phút một lần

**Topic:** `observation/sensor/{dataStreamId}`
**Message:**

```json
{
  "sensorRecords": [
    {
      "dataStreamId": "2",
      "result": "31.5oC"
    },
    {
      "dataStreamId": "3",
      "result": "45%rH"
    }
    ...
  ],
  "resultTime": "2024-10-04T14:48:00.000Z"
}

// dataStreamId là ID của cảm biến
// result là kết quả trả về của cảm biến kèm đơn vị
// resultTime là thời gian ngay thời điểm phần cứng truyền gói tin nhằm đồng bộ thời gian với hệ thống

```

---

## Luồng hoạt động:

Dữ liệu cảm biến sẽ được tự động gửi từ phần cứng lên server với chu kỳ là `x` phút một lần (`x` có thể cấu hình được).

Khi Sever muốn điều khiển thiết bị cần gửi theo form dữ liệu đã định nghĩa tại phần subcrise khi này phần cứng sẽ nhận được và thực thi lệnh đó; Sau khi thực thi xong thì phần cứng sẽ gửi lại 1 gói tin y chang gói tin Server gửi xuống để xác nhận là nó đã thực thi xong lệnh. Nếu Server không nhận được gói tin phản hồi này có nghĩa là phần cứng chưa thực thi được lệnh.

Khi có tín hiệu điều khiển trực tiếp bằng tay lên thiết bị qua nút ấn thì phần cứng sẽ tự động gửi gói tin như phần publish lên Server để đồng bộ trạng thái. Khi này server cần loop lại gói tin y vậy để phần cứng xác nhận gửi thành công.

 auto mode có thể bàn lại nếu muốn có chế độ auto ví dụ trong chế độ đó cần làm gì
Khi này bật chế độ auto lên thì phần cứng sẽ chạy theo cấu hình cài đặt trước và tự động gửi đồng bộ dữ liệu lên server nếu có thay đổi về trạng thái.

```

```