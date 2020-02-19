import { r, Connection } from 'rethinkdb-ts';

import { assign, noop } from 'lodash';

import { validate } from 'class-validator';

import { User, Group, Message } from './rethinkdb.model';

const DB = 'minichat';

export var conn: Connection = null;
export const connp = r.connect({ db: DB }).then(c => (conn = c));

export const users = r.table<User>('users');
export const groups = r.table<Group>('groups');
export const messages = r.table<Message>('messages');
// export const joins = r.table<Join>('joins');

async function main() {
  await connp;
  await r
    .dbCreate(DB)
    .run(conn)
    .catch(noop);
  await Promise.all(
    ['users', 'groups', 'messages'].map(c =>
      r
        .tableCreate(c)
        .run(conn)
        .catch(noop),
    ),
  );
  // await users
  //   .insert(
  //     {
  //       id: 'krist7599555',
  //       unreads: {
  //         'room-1': r.now(),
  //         'room-2': r.now(),
  //         'room-3': r.now(),
  //       },
  //     },
  //     { conflict: 'update' },
  //   )
  //   .run(conn);

  // await messages
  //   .insert([
  //     { roomid: 'room-1', text: 'txx1', time: r.now() },
  //     { roomid: 'room-1', text: 'txx2', time: r.now() },
  //     { roomid: 'room-1', text: 'txx3', time: r.now() },
  //     { roomid: 'room-3', text: 'txx4', time: r.now() },
  //     { roomid: 'room-3', text: 'txx5', time: r.now() },
  //   ])
  //   .run(conn);
  // console.log(await users.run(conn));
  // console.log('finish');
}
export const ready = main();

export function getusers() {
  return users.run(conn);
}
export function getmessages() {
  return messages.run(conn);
}
export function getgroups() {
  return groups.run(conn);
}

export function createuser(id: string) {
  return users.insert({ id }).run(conn);
}
export function creategroup(title: string) {
  return groups.insert({ title }).run(conn);
}
export function send(userid: string, roomid: string, text: string) {
  return messages.insert({ userid, roomid, text, time: r.now() }).run(conn);
}
export function allmessages(roomid: string) {
  return messages.filter({ roomid }).run(conn);
}
export function read(userid: string, roomid: string) {
  return users
    .get(userid)
    .update({
      unreads: {
        [roomid]: r.now(),
      },
    })
    .run(conn);
}

export function unreadmessage(userid: string) {
  return users
    .get(userid)('unreads')
    .coerceTo('array')
    .map(unred => ({
      roomid: unred(0),
      latest: unred(1),
      messages: messages
        .coerceTo('array')
        .filter(msg =>
          r.and(msg('roomid').eq(unred(0)), msg('time').gt(unred(1))),
        ),
    }));
}
