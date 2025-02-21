import { ObjectId, WithId } from 'mongodb';

export interface Log {
  _id: ObjectId;
  apiName: string;
  data: string;
  timestamp: Date;
}

export type OutPutLog = WithId<Log>[];
