import { BadRequestException } from '@nestjs/common';
import { noop } from 'lodash';
import { Connection, r } from 'rethinkdb-ts';
import { Group, Message, User } from './_rethinkdb.model';

// init value

export const RETHINKDB_NAME = 'minichat';

export var conn: Connection = null;
export const ready = r.connect({ db: RETHINKDB_NAME }).then(c => (conn = c));

export const users = r.table<User>('users');
export const groups = r.table<Group>('groups');
export const messages = r.table<Message>('messages');

// init state

export async function reset(db: string) {
  await r
    .dbCreate(db)
    .run(conn)
    .catch(noop);
  conn.use(db);
  for (const c of ['users', 'groups', 'messages']) {
    await r
      .tableCreate(c)
      .run(conn)
      .catch(noop);
  }
  await users.delete().run(conn);
  await groups.delete().run(conn);
  await messages.delete().run(conn);
}

export async function listenGroups(cb: Function) {
  await ready;
  const cursor = await groups.changes().run(conn);
  cursor.each((err, res) => {
    cb(res.new_val);
  });
}
export async function listenMessages(cb: Function) {
  await ready;
  const cursor = await messages.changes().run(conn);
  cursor.each((err, res) => {
    cb(res.new_val);
  });
}

// methods

export function getUsers() {
  return users.run(conn);
}
export function getMessages() {
  return messages.run(conn);
}
export function getGroups() {
  return groups.run(conn);
}

export function getGroup(roomid: string) {
  return groups.get(roomid).run(conn);
}
export function getUser(userid: string) {
  return users.get(userid).run(conn);
}

export function createUser(id: string) {
  return users.insert({ id, unreads: {} }, { conflict: 'error' }).run(conn);
}
export function createGroup(title: string, id?: string) {
  return groups
    .insert(id ? { id, title } : { title }, { conflict: 'error' })
    .run(conn);
}

export function isJoined(userid: string, roomid: string) {
  return users
    .get(userid)('unreads')
    .hasFields(roomid)
    .run(conn);
}

export async function joinGroup(userid: string, roomid: string) {
  if ((await getGroup(roomid)) && !(await isJoined(userid, roomid))) {
    return users
      .get(userid)
      .update({
        unreads: {
          [roomid]: r.epochTime(0),
        },
      })
      .run(conn);
  } else {
    throw new BadRequestException(`cat't join, userid or roomid not exist`);
  }
}

export async function sendMessage(
  userid: string,
  roomid: string,
  text: string,
) {
  if (await isJoined(userid, roomid)) {
    return messages.insert({ userid, roomid, text, time: r.now() }).run(conn);
  } else {
    throw new BadRequestException(`userid not join room ${roomid} yet`);
  }
}
export function getGroupsMessages(roomid: string) {
  return messages.filter({ roomid }).run(conn);
}

export async function read(userid: string, roomid: string) {
  if (await isJoined(userid, roomid)) {
    return users
      .get(userid)
      .update({
        unreads: {
          [roomid]: r.now(),
        },
      })
      .run(conn);
  } else {
    throw new BadRequestException(`may be not join ${roomid} room yet`);
  }
}

export function getUserUnreads(userid: string) {
  return users
    .get(userid)('unreads')
    .run(conn);
}
export function getUserUnreadsMessage(userid: string) {
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
    }))
    .run(conn);
}
export async function getUserUnreadsMessageGroup(
  userid: string,
  roomid: string,
) {
  const latest = await users
    .get(userid)('unreads')(roomid)
    .run(conn);
  return {
    roomid: roomid,
    latest: latest,
    messages: await messages
      .coerceTo('array')
      .filter(msg => r.and(msg('roomid').eq(roomid), msg('time').gt(latest)))
      .run(conn),
  };
}

// HOOK
