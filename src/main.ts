import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/setup-swagger';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
];

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value || value.trim().length === 0) {
    return DEFAULT_CORS_ORIGINS;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : DEFAULT_CORS_ORIGINS;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: parseCorsOrigins(config.get<string>('CORS_ORIGIN')),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  setupSwagger(app);
  await app.listen(config.get('PORT', 3000));
}
bootstrap();
