import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopic extends Document {
  code: string;
  title: string;
  createdAt: Date;
}

const TopicSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, length: 6 },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Topic = (mongoose.models.Topic as Model<ITopic>) || mongoose.model<ITopic>('Topic', TopicSchema);
