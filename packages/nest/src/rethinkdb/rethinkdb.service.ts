import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { RETHINK_DB_CONNECTION } from './rethinkdb.provider';
import { r, Connection, RTable } from 'rethinkdb-ts';
import { User, Room, Message } from './rethinkdb.interface';
import * as _ from 'lodash';
import { RoomIO } from '../app.gateway.model';
import Minichat from '../minichat/minichat';

export const users = r.table<User>('users');
export const rooms = r.table<Room>('rooms');
export const messages = r.table<Message>('messages');

function watch<T>(table: RTable<T>, conn: Connection, cb: (val: T) => void) {
  table
    .changes()
    .run(conn)
    .then(cursor => cursor.each((err, { old_val, new_val }) => cb(new_val)));
}

@Injectable()
export class RethinkdbService extends Minichat {
  constructor(@Inject(RETHINK_DB_CONNECTION) connection: Connection) {
    super(connection);
  }
}
