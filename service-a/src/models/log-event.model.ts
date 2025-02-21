import { IpInfo, SearchFilter } from './ipinfo.model';
import { TLogs } from './../common/enums';

export interface LogEvent<T> {
  readonly query: string | SearchFilter;
  readonly result: T | IpInfo;
  readonly apiName: TLogs;
}
