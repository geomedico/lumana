import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IpInfo } from '../models/ipinfo.model';

@Injectable()
export class IPWhoisService {
  private readonly logger = new Logger(IPWhoisService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchIPData(ip: string): Promise<IpInfo> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://ipwhois.app/json/${ip}`),
      );

      if (!response?.data || response.status !== 200) {
        throw new Error(
          `Invalid response from IPWhois: ${JSON.stringify(response?.data)}`,
        );
      }

      return response?.data;
    } catch (error) {
      this.logger.error(
        `Error fetching data for IP ${ip} from IPWhois:`,
        error,
      );
      return Promise.reject(error);
    }
  }
}
