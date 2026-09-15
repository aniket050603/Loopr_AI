import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    /** UI theme the account last chose; applied on sign-in. */
    preferredTheme: { type: String, enum: ['light', 'dark'], default: 'dark' },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model<User>('User', userSchema);
