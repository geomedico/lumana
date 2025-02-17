export class SearchEvent {
  constructor(
    public readonly query: string,
    public readonly results: any,
    public readonly timestamp: Date
  ) {}
}