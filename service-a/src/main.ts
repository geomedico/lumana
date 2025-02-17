import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as YAML from 'yamljs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  const configService = app.get(ConfigService);
  const PORT = +configService.get<number>('PORT_A', 3000);

  const swaggerDocument = YAML.load('swagger.yaml');
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  await app.listen(PORT);
}
bootstrap()
