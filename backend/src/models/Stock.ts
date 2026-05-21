import mongoose, { Document, Schema } from 'mongoose';

export interface IStock extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
}

const StockSchema = new Schema<IStock>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
  },
  { timestamps: true }
);

StockSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export default mongoose.model<IStock>('Stock', StockSchema);
