import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class Util {
  private readonly logger = new Logger(Util.name);

  public parseLogEntry(log: string) {
    try {
      if (!this.isJsonParsable(log)) {
        return { executionTime: log, query: null };
      }

      const parsed = JSON.parse(log);

      if (
        parsed.query &&
        typeof parsed.query === 'string' &&
        this.isJsonParsable(parsed.query)
      ) {
        parsed.query = JSON.parse(parsed.query);
      }

      return parsed;
    } catch (err) {
      this.logger.error(`Failed to parse log entry: ${log}`, err.stack);
      return { executionTime: log, query: null };
    }
  }

  public isJsonParsable(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }
}
