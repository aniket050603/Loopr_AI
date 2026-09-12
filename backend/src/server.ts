import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config.js';

async function main(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log('✅ Connected to MongoDB');

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`🚀 API listening on http://localhost:${config.port}`);
  });
}

main().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
