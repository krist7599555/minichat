import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { RoomService } from './room.service';
// const imports = process.env.NODE_ENV == "production" 
//   ? [ ServeStaticModule.forRoot({ rootPath: path.join(__dirname, '../static'), }) ] 
//   : []
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AppGateway, AuthService, RoomService],
})
export class AppModule {}
