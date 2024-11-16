import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: '*',
  });

  const config = new DocumentBuilder()
    .setTitle('OpenAI API')
    .setVersion('1.0')
    .setDescription('API for interacting with OpenAI chat completions')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('swagger', app, () =>
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
