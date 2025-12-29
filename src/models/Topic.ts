import { ObjectId } from "mongodb";

export interface ITopic {
  _id?: ObjectId;
  title: string;
  createdAt?: Date;
}

export const TOPIC_COLLECTION = "topics";
