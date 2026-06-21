import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  owner: mongoose.Types.ObjectId;
}

const transactionSchema = new Schema({
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ['income', 'expense'] },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);