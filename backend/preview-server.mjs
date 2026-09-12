// Local preview launcher: in-memory MongoDB -> seed -> API server, one process.
// Usage: npm run preview   (requires `npm run build` first — serves from dist/)
import { MongoMemoryServer } from 'mongodb-memory-server';

// Set env BEFORE importing dist modules — config.js reads these at import time.
// dotenv (loaded inside config) does not override values already present.
const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri('financial_dashboard');
process.env.JWT_SECRET = 'preview-only-secret';
process.env.PORT = '4000';
process.env.CLIENT_ORIGIN = 'http://localhost:5173,http://127.0.0.1:5173';
console.log(`✅ In-memory MongoDB at ${process.env.MONGODB_URI}`);

const { seed } = await import('./dist/scripts/seed.js');
await seed();

const mongoose = (await import('mongoose')).default;
await mongoose.connect(process.env.MONGODB_URI);

const { createApp } = await import('./dist/app.js');
const { config } = await import('./dist/config.js');
const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`🚀 Preview API listening on http://localhost:${config.port}`);
});

async function shutdown() {
  console.log('\nShutting down preview...');
  server.close();
  await mongoose.disconnect().catch(() => {});
  await mongod.stop().catch(() => {});
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
