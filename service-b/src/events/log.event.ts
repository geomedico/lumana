export class LogEvent {
  constructor(
    public readonly eventType: string,
    public readonly data: any,
    public readonly timestamp: Date
  ) {}
}