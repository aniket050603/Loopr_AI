import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../config.js';

async function main(): Promise<void> {
  // Pin a known-good port BEFORE importing smoke.js (it computes its base URL at
  // module load). Avoids interference from a stray PORT env var in the shell.
  process.env.PORT = '4100';
  config.port = 4100;

  console.log('⏳ Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('financial_dashboard');
  config.mongoUri = process.env.MONGODB_URI;
  console.log(`✅ In-memory MongoDB at ${config.mongoUri}`);

  const { seed } = await import('./seed.js');
  await seed();

  const { runSmoke } = await import('./smoke.js');
  const exitCode = await runSmoke();

  await mongod.stop();
  process.exit(exitCode);
}

main().catch(async (error) => {
  console.error('❌ Smoke setup failed:', error);
  process.exit(1);
});
