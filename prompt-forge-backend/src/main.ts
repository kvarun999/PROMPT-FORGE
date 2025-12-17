import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ----------------------------------------------------
  // ADD THIS LINE (Allows your Vue frontend to talk to Nest)
  app.enableCors();
  // ----------------------------------------------------

  await app.listen(3000);
}
bootstrap();
