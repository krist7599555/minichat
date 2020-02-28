import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';

import { RethinkdbModule } from './rethinkdb/rethinkdb.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../static'),
    }),
    RethinkdbModule.forRoot({
      db: process.env.NODE_ENV == 'production' ? 'minichat' : 'testminichat',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
