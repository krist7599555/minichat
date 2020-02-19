import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { join } from 'path';

import { Request, Response } from 'express';

import { AppModule } from './app.module';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.useStaticAssets(join(__dirname, '..', 'static'));
  // @ts-ignore
  // app.get('*', function(request: Request, response: Response) {
  //   response.sendFile(join(__dirname, '..', 'static/index.html'));
  // });
  await app.listen(+PORT);
  console.log(`run on http://0.0.0.0:${PORT}`);
}
bootstrap();
