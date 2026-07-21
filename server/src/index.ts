import staticPlugin from '@elysia/static';
import { Elysia } from "elysia";
import { env } from './config/env';
import './config/firebase';
import './config/mqtt'; // Initialize MQTT connection

const app = new Elysia()
  .onError(({ error }) => {
    console.error(error)
    return 'Internal Server Error'
  })
  .use(
    staticPlugin({
      assets: 'public',
      prefix: '/',
    })
  )
  .get("/api/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .listen({
    port: env.PORT,
    hostname: env.HOST,
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
