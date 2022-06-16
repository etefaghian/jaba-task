import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as responseTime from 'response-time';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(responseTime());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
}
bootstrap();
