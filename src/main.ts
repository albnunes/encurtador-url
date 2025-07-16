import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AppLoggerService } from './shared/infrastructure/logging';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = app.get(AppLoggerService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get('Reflector')));

  // Configurar cookie parser
  app.use(cookieParser());

  app.enableCors({
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('encurtador-url API')
      .setDescription('API REST para encurtamento de URLs com autenticação')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log('Application started successfully', {
    port,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
  if (process.env.NODE_ENV === 'development') {
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  }
  
}

bootstrap();
