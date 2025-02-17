import { Module } from '@nestjs/common';
import { Util } from './util-service.util';

@Module({
  providers: [Util],
  exports: [Util],
})
export class UtilsModule {}
