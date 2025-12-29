import { ObjectId } from 'mongodb';

export interface IAdmin {
  _id?: ObjectId;
  email: string;
  password: string;
}

export const ADMIN_COLLECTION = 'admins';
