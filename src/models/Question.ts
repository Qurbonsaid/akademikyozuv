import { ObjectId } from 'mongodb';

export interface IQuestion {
  _id?: ObjectId;
  mavzuId: ObjectId;
  type: 'text' | 'choice';
  order: number;
  question: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
}

export const QUESTION_COLLECTION = 'questions';
