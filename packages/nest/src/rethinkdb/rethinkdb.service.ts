import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { r, Connection, RTable } from 'rethinkdb-ts';
import { User, Room, Message } from './rethinkdb.interface';
import * as _ from 'lodash';
import { RoomIO } from '../app.gateway.model';
import Minichat from '../minichat/minichat';
import { RETHINKDB_CONNECTION } from './rethinkdb.provider';

@Injectable()
export class RethinkdbService extends Minichat {
  constructor(@Inject(RETHINKDB_CONNECTION) connection: Connection) {
    super(connection);
  }
}
