import { ObjectId } from 'mongodb';

export interface IAnswer {
  questionId: ObjectId;
  answer: string | number;
  isCorrect: boolean;
}

export interface ISubmission {
  _id?: ObjectId;
  mavzuId: ObjectId;
  fullName: string;
  group: string;
  date?: Date;
  totalScore: number;
  maxScore: number;
  answers: IAnswer[];
}

export const SUBMISSION_COLLECTION = 'submissions';
