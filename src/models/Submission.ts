
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAnswer {
  questionId: Types.ObjectId;
  answer: string | number;
  isCorrect: boolean;
}

export interface ISubmission extends Document {
  mavzuId: Types.ObjectId;
  fullName: string;
  group: string;
  date: Date;
  totalScore: number;
  maxScore: number;
  answers: IAnswer[];
}

const AnswerSchema: Schema = new Schema({
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  answer: { type: Schema.Types.Mixed, required: true },
  isCorrect: { type: Boolean, required: true },
});

const SubmissionSchema: Schema = new Schema({
  mavzuId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  fullName: { type: String, required: true },
  group: { type: String, required: true },
  date: { type: Date, default: Date.now },
  totalScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  answers: [AnswerSchema],
});

export const Submission = (mongoose.models.Submission as Model<ISubmission>) || mongoose.model<ISubmission>('Submission', SubmissionSchema);
