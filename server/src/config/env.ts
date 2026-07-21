// Read from process.env
const env = {
  //Server
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || "0.0.0.0",

  // Firebase
  FIREBASE_SERVICE_ACCOUNT_PATH:
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json',

  // MQTT
  MQTT_HOST: process.env.MQTT_HOST || 'broker.hivemq.com',
  MQTT_PORT: Number(process.env.MQTT_PORT) || 1883,
} as const

// Validate
const file = Bun.file(env.FIREBASE_SERVICE_ACCOUNT_PATH)
if (!(await file.exists())) {
  console.error(
    `FATAL: Firebase service account file not found at:\n` +
    ` ->  ${env.FIREBASE_SERVICE_ACCOUNT_PATH}\n\n` +
    `Instructions:\n` +
    `   1. Go to Firebase Console -> Project Settings -> Service Accounts\n` +
    `   2. Click "Generate New Private Key"\n` +
    `   3. Save the JSON file to the server/ folder as: firebase-service-account.json\n`
  )
  process.exit(1)
}

export {env}
