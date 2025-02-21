export interface LogEvent {
  readonly apiName: string;
  readonly query: string;
  readonly result: Record<string, any>;
}
