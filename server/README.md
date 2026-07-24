# IoT Durian Backend Server

This repository contains the backend service for the IoT Durian Disease Detector & Monitoring System. The server acts as a bridge between the frontend dashboard and the physical IoT hardware out in the field, providing RESTful APIs and functioning as an active MQTT client.

## Architecture & Technology Stack

- **ElysiaJS**: High-performance web framework used for the REST API layer.
- **Bun**: JavaScript runtime and package manager.
- **MQTT.js**: Client library handling Pub/Sub communication with the HiveMQ broker for telemetry ingestion and device control.
- **Firebase Admin SDK**: Server-side integration with Firestore database for secure, admin-level data operations and logging.
- **Static File Serving**: The compiled React dashboard (`../dashboard/dist`) is served statically via the `@elysia/static` plugin from the `public` directory.

## Development Setup

The backend utilizes `bun` for dependency management and execution.

### Prerequisites
Ensure that the `firebase-service-account.json` file is correctly placed in the root of the server directory. This file is strictly required by the Firebase Admin SDK to authenticate securely. Furthermore, ensure your `.env` file is configured with the necessary MQTT broker credentials and application ports.

```bash
# 1. Install dependencies
bun install

# 2. Start the development server (Defaults to http://localhost:3000)
# Includes hot-reloading for server-side code changes.
bun run dev
```

Upon startup, the server will connect to the MQTT broker, subscribe to the configured sensor telemetry and hardware confirmation topics, and begin listening for API requests.

## Production Build

To prepare the server for production deployment, compile the TypeScript codebase into a standalone executable binary using Bun.

```bash
# Compile the server application
bun run build
```

This command generates an executable that can be run directly without requiring the Bun runtime to be installed on the target machine.

## Database & Messaging Note

All data operations are handled exclusively via the Firebase Admin SDK interacting with Firestore. Hardware interactions bypass direct HTTP calls entirely, strictly utilizing the MQTT protocol to push control tasks and receive echo-confirmations to ensure execution reliability.