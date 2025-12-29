import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IQuestion extends Document {
  mavzuId: Types.ObjectId;
  type: 'text' | 'choice';
  order: number;
  question: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
}

const QuestionSchema: Schema = new Schema({
  mavzuId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  type: { type: String, enum: ['text', 'choice'], required: true },
  order: { type: Number, required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctIndex: { type: Number },
  correctAnswer: { type: String },
});

export const Question = (mongoose.models.Question as Model<IQuestion>) || mongoose.model<IQuestion>('Question', QuestionSchema);
