import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { auth } from './auth/auth';

async function bootstrap() {
  // rawBody: true keeps the raw bytes for Paystack webhook verification.
  const app = await NestFactory.create(AppModule, { rawBody: true, cors: { origin: process.env.WEB_URL ?? 'http://localhost:3000', credentials: true } });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api', { exclude: ['api/auth/(.*)'] });
  const express = app.getHttpAdapter().getInstance();
  express.use('/api/auth', toNodeHandler(auth));
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Trex API on :${process.env.PORT ?? 3001}`);
}
bootstrap();
