import { Schema, model, type InferSchemaType } from 'mongoose';

export const TRANSACTION_STATUSES = ['Paid', 'Pending'] as const;
export const TRANSACTION_CATEGORIES = ['Revenue', 'Expense'] as const;
export const TRANSACTION_FIELDS = [
  'id',
  'date',
  'amount',
  'category',
  'status',
  'user_id',
  'user_profile',
] as const;

export type TransactionField = (typeof TRANSACTION_FIELDS)[number];

const transactionSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: TRANSACTION_CATEGORIES, required: true },
    status: { type: String, enum: TRANSACTION_STATUSES, required: true },
    user_id: { type: String, required: true, index: true },
    user_profile: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

transactionSchema.index({ date: -1 });
transactionSchema.index({ amount: -1 });
transactionSchema.index({ category: 1, status: 1 });

export type Transaction = InferSchemaType<typeof transactionSchema>;

export const TransactionModel = model<Transaction>('Transaction', transactionSchema);
