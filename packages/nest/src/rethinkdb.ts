import * as _ from 'lodash';
import { r } from 'rethinkdb-ts';
const DATABASE_NAME = 'minichat';
import { User, Room, Message } from './interface';

export const connection_pool = r.connectPool({ db: DATABASE_NAME });
export const users           = r.table<User>('users');
export const rooms           = r.table<Room>('rooms');
export const messages        = r.table<Message>('messages');

export async function ensure_table() {
  await connection_pool;
  await r.dbCreate(DATABASE_NAME)    .run().catch(_.noop);
  await r.tableCreate('users')       .run().catch(_.noop);
  await r.tableCreate('rooms')       .run().catch(_.noop);
  await r.tableCreate('messages')    .run().catch(_.noop);
};

export async function reset() {
  await connection_pool;
  await r.dbDrop(DATABASE_NAME).run().catch(_.noop);
  await ensure_table();
};