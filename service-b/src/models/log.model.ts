import { ObjectId } from 'mongodb';

export interface Log {
  _id: ObjectId;
  eventType?: string;
  data: string;
  timestamp: Date;
}
