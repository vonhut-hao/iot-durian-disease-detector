# IoT Durian Disease Detector & Monitoring System

This project is a comprehensive digital twin and environmental monitoring system tailored for agricultural management, specifically focusing on Durian farming. It provides live telemetry tracking, hardware actuator control, and QR-based traceability for individual trees. The architecture establishes a foundation for upcoming AI-based leaf disease diagnosis features.

## System Overview

The system bridges physical IoT devices in the farm with a cloud-based dashboard through a robust, asynchronous message broker, while utilizing a real-time database to maintain state.

### Key Features
- **Live Telemetry:** Real-time environmental monitoring (air temperature, air humidity, soil moisture) gathered from field sensors via MQTT.
- **Actuator Control:** Manual and automated control of irrigation relays utilizing a bidirectional Echo-Confirm mechanism to ensure hardware execution reliability.
- **QR Traceability:** Immediate access to individual tree profiles and microclimate data via physical QR code scanning.
- **Future Scope:** Integration of an AI inference engine for detecting and diagnosing durian leaf diseases from uploaded images.

## Architecture & Technology Stack

The platform is designed using a Top-Down architecture approach, separated into distinct specialized layers:

- **Frontend Dashboard (`/dashboard`)**: A web-based user interface built with **React**, **Vite**, **Tailwind CSS**, and **Recharts**. It utilizes the **Firebase Client SDK** for real-time state synchronization (`onSnapshot`).
- **Backend Server (`/server`)**: A high-performance API server and MQTT client built on **Bun** and **ElysiaJS**. It handles REST requests, parses MQTT telemetry, and interfaces securely with the database via the **Firebase Admin SDK**.
- **Database**: **Firebase Firestore** serves as the central data repository for tree profiles, sensor logs, and task execution states.
- **Message Broker**: **HiveMQ** acts as the Pub/Sub intermediary facilitating fast, lightweight communication between the backend server and field ESP32 microcontrollers.

## Directory Structure

- `/server`: Contains the backend logic, MQTT message handlers, REST API routes, and database services.
- `/dashboard`: Contains the frontend React application, UI components, and real-time charting logic.
- `/.docs`: Contains detailed architectural documentation, MQTT topic maps, and implementation plans.

## Getting Started

Please refer to the specific README files located within the `server/` and `dashboard/` directories for detailed setup, configuration, and execution instructions.
