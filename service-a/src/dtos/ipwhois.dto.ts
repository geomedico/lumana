import { IsIP } from 'class-validator';

export class IPWhoisDto {
  @IsIP()
  ip: string;
}