# IoT Durian Dashboard

This is the web-based monitoring and control interface for the IoT Durian Disease Detector system. The dashboard provides comprehensive environmental telemetry visualization, physical actuator control, and QR-code-based tree profile retrieval for farm management.

## Tech Stack

- **React 19 & Vite**: Frontend framework and lightning-fast build tool.
- **Tailwind CSS & Shadcn UI**: Utility-first CSS framework and accessible component system.
- **Recharts**: Charting library utilized for rendering dynamic, live telemetry graphs.
- **Firebase Client SDK**: Handles real-time data synchronization via `onSnapshot` listeners to Firestore, enabling instantaneous UI updates without manual polling.
- **Bun**: JavaScript runtime and package manager.

## Development Setup

The project uses `bun` as the package manager to maintain consistency across the entire repository.

### Prerequisites
Ensure your Firebase client configuration located at `src/config/firebase.ts` correctly matches your Firebase Console project settings. Without correct configuration, real-time listeners will fail to retrieve database records.

```bash
# 1. Install dependencies
bun install

# 2. Start the development server (Defaults to http://localhost:5173)
bun run dev
```

Note: The development server supports Hot Module Replacement (HMR). The backend server must be running concurrently (default port 3000) to resolve REST API requests successfully.

## Production Build

The system architecture is designed to serve the frontend statically through the Elysia backend. The frontend must be built and output to the backend's static directory.

```bash
# Build the application for production
bun run build
```

This command bundles the assets and automatically outputs them to the `../server/public` directory. Once built, the backend server handles the distribution of these static files on its configured port (default `http://localhost:3000`).

## UI Data Flow

The dashboard fetches initial static profiles and configurations via standard REST HTTP requests to the backend. However, dynamic state data (such as fluctuating sensor values or relay confirmation states) are streamed directly from Firestore using the Firebase Client SDK. This dual-approach ensures fast initial loads combined with robust, bidirectional real-time capabilities.