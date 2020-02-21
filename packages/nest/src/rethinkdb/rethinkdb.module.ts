import { Module } from '@nestjs/common';
import { RethinkdbService } from './rethinkdb.service';
import { RethinkdbConnectionProvider } from './rethinkdb.provider';

@Module({
  providers: [RethinkdbService, RethinkdbConnectionProvider],
  exports: [RethinkdbService],
})
export class RethinkdbModule {}
