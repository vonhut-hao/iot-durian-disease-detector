import staticPlugin from '@elysia/static';
import { Elysia } from "elysia";
import { env } from './config/env';
import './config/firebase';
import './config/mqtt'; // Initialize MQTT connection
import { deviceRoute } from './routes/device.route';
import { treeRoute } from './routes/tree.route';

const app = new Elysia()
  .onError(({ code, error }) => {
    if (code === 'NOT_FOUND') return 'Not Found';
    console.error(error)
    return 'Internal Server Error'
  })
  .use(deviceRoute)
  .use(treeRoute)
  .get("/api/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .get('/*', async ({ request }) => {
    const url = new URL(request.url);
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(`public${path}`);
    if (await file.exists()) {
      return file;
    }
    return Bun.file('public/index.html');
  })
  .listen({
    port: env.PORT,
    hostname: env.HOST,
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
