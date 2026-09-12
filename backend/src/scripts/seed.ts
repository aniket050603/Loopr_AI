import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';
import { config } from '../config.js';
import { TransactionModel } from '../models/Transaction.js';
import { UserModel } from '../models/User.js';
import rawTransactions from '../data/transactions.json' with { type: 'json' };

interface RawTransaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}

export async function seed(): Promise<void> {
  await mongoose.connect(config.mongoUri);

  console.log('⏳ Seeding transactions from data/transactions.json...');
  const docs = (rawTransactions as RawTransaction[]).map((t) => ({
    id: t.id,
    date: new Date(t.date),
    amount: t.amount,
    category: t.category,
    status: t.status,
    user_id: t.user_id,
    user_profile: t.user_profile,
  }));

  await TransactionModel.deleteMany({});
  await TransactionModel.insertMany(docs, { ordered: false });
  console.log(`✅ Seeded ${docs.length} transactions`);

  const demoEmail = 'demo@fin.com';
  const existing = await UserModel.findOne({ email: demoEmail });
  if (!existing) {
    const passwordHash = await bcrypt.hash('demo1234', 10);
    await UserModel.create({ email: demoEmail, name: 'Demo User', passwordHash });
    console.log(`✅ Created demo user ${demoEmail} / demo1234`);
  } else {
    console.log(`ℹ️  Demo user ${demoEmail} already exists`);
  }

  await mongoose.disconnect();
  console.log('✅ Seed complete');
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  seed().catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
}
