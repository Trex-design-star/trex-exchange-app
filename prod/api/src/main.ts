import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.WEB_URL ?? 'http://localhost:3000' });
  await app.listen(Number(process.env.API_PORT ?? 3001));
}
bootstrap();
