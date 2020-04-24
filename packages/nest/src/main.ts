import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
// import './rethinkdb';
import './rethink';
import { RedisIoAdapter } from './socket.adapter';
import { connection_pool, ensure_table } from './rethinkdb';
import * as cookieParser from 'cookie-parser'
const PORT = process.env.PORT || 3000;
import * as morgan from 'morgan'
import { BaseErrorFilter } from './exception.filter';
async function bootstrap() {
  await connection_pool;
  await ensure_table();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app
    .use(morgan('dev'))
    .use(cookieParser())
    .useGlobalFilters(new BaseErrorFilter())
    .useWebSocketAdapter(new RedisIoAdapter(app))
    .listen(+PORT);
  console.log(`run on http://0.0.0.0:${PORT}`);
}
bootstrap();
