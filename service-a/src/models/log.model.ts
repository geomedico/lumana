import { TLogs } from './../common/enums';

export interface ILog {
  apiName: TLogs;
  executionTime: number;
  timestamp: number;
  query?: string | Record<string, any>;
}
