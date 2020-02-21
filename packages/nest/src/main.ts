import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
// import './rethinkdb';
import './rethink';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  // const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // await app.listen(+PORT);
  // console.log(`run on http://0.0.0.0:${PORT}`);
}
bootstrap();
