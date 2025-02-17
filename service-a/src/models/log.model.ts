import { TLogs } from './../common/enums';

export interface ILog {
  api: TLogs;
  executionTime: number;
  timestamp: number;
  query?: string | Record<string, any>;
}
