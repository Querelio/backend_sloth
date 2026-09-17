import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function isSwaggerEnabled(): boolean {
  const value = process.env.SWAGGER_ENABLED ?? 'true';
  return value.toLowerCase() !== 'false';
}

export function setupSwagger(app: INestApplication): void {
  if (!isSwaggerEnabled()) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('SlothBoard Trainer API')
    .setDescription('REST API for trainer activity management')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addServer('http://localhost:3000', 'Local API')
    .addTag('auth')
    .addTag('users')
    .addTag('institutions')
    .addTag('classes')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
}
