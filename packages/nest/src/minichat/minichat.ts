/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { r } from 'rethinkdb-ts';
import { User, Message, Room, RoomExtend } from '../interface';
import { Connection } from 'rethinkdb-ts';
import * as _ from 'lodash';
import { users, rooms, messages } from '../rethinkdb/index';
import { HttpException, BadRequestException } from '@nestjs/common';


const assign = Object.assign;
const clone = <T>(orig: T): T =>
  Object.assign(Object.create(Object.getPrototypeOf(orig)), orig);


export async function get_rooms(userid: string) {
  return users.get(userid)('rooms').default({}).coerceTo('array').map(function(o) {
    const roomid = o(0)
    const latest = o(1)('latest')
    const msgs = messages.filter({ roomid: roomid as any })
    return rooms.get(roomid).merge({
      // @ts-ignore
      latest_message: msgs.max('time')('text').default(null),
      // @ts-ignore
      time:           msgs.max('time')('time').default(r.now()),
      unreads:        msgs.filter(function(m) {
        return r.and(
          m('time').gt(latest),
          m('roomid').eq(roomid)
        )
      }).count(),
    })
  }).default([]).run()
}

export default class Minichat {
  private roomid?: string;
  private userid?: string;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }

  // * //////////////////////////////////////////////////////////////////////
  // * SETTER

  public user(userid) {
    return assign(clone(this), { userid });
  }
  public room(roomid) {
    return assign(clone(this), { roomid });
  }

  // * //////////////////////////////////////////////////////////////////////
  // * GETTER

  async get_user() {
    if (!this.userid) throw new Error('userid is not set');
    const u = await users.get(this.userid).run();
    if (!u) throw new Error(`user ${this.userid} not exist`);
    return u;
  }
  async get_room() {
    if (!this.roomid) throw new Error('roomid is not set');
    const r = await users.get(this.roomid).run();
    if (!r) throw new Error(`user ${this.roomid} not exist`);
    return r;
  }
  async assert_user_exist() {
    return this.get_user();
  }
  async get_users() {
    return users.run();
  }
  async get_rooms() {
    return rooms.run();
  }
  async set_room_title(title: string) {
    await this.assert_is_join_room();
    await rooms.get(this.roomid)
      .update({ title })
      .run();
  }

  async get_rooms_auth(): Promise<RoomExtend[]> {
    const my_rooms = users.get(this.userid)('rooms');
    return rooms.map(room => {
      const is_joined = my_rooms(room('id')).default(false);
      return room.merge(
        is_joined.branch(
          {
            joined: true,
            unreads: messages.filter(msg =>
              r.and(
                msg('roomid').eq(room('id')),
                msg('time').gt(my_rooms(room('id'))('latest')),
              ),
            ).count(),
            latest_message: messages.filter(msg => msg('roomid').eq(room('id')))
              .max(msg => msg('time'))('text')
              .default(null),
          },
          { joined: false },
        ),
      );
    }).run();
  }
  async get_joined_rooms_auth() {
    return get_rooms(this.userid)
  }

  async get_room_messages() {
    await this.mark_as_read(); // update reading time
    return messages
      .filter(msg => msg('roomid').eq(this.roomid))
      .map(msg => msg.merge({
        user: users.get(msg('userid')).pluck('id', 'display_name')
      }))
      .orderBy(r.asc('time'))
      .run();
  }
  async get_room_unread_messages() {
    const me = users.get(this.userid);
    return messages.filter(msg =>
      r.and(
        msg('roomid').eq(this.roomid),
        msg('time').gt(me('rooms')(this.roomid)('latest')),
      ),
    ).merge(m => ({
      user: users.get(m('userid')).pluck('display_name')
    }))
      .orderBy(r.asc('time'))
      .run();
  }

  // * //////////////////////////////////////////////////////////////////////
  // * CREATER

  async create_room(title: string): Promise<Room> {
    if (!title) throw new BadRequestException("require title to create room");
    return await rooms.insert(
      { title: title, create_time: r.now() },
      { returnChanges: true },
    )
      .run()
      .then(wr => {
        if (wr.inserted) return wr.changes[0].new_val;
        if (wr.errors) throw new Error(wr.first_error);
        throw wr;
      });
  }
  async create_and_join_room(title?: string) {
    const room = await this.create_room(title);
    await this.room(room.id).do_join_room();
    return room;
  }
  async create_message(text: string) {
    await this.assert_is_join_room();
    await messages.insert({
      userid: this.userid,
      roomid: this.roomid,
      time: r.now(),
      text,
    }).run();
  }

  // * //////////////////////////////////////////////////////////////////////
  // * READING

  async mark_as_read() {
    await users.get(this.userid)
      .update({ rooms: { [this.roomid]: { latest: r.now() } } })
      .run();
  }

  // * //////////////////////////////////////////////////////////////////////
  // * WATCHING

  async watch_rooms(cb = null) {
    const cursor = await rooms.changes().run();
    if (_.isFunction(cb)) {
      cursor.each((...rest) => cb(...rest));
    } else {
      return cursor;
    }
  }
  async watch_messages(cb = null) {
    const cursor = await messages.changes().run();
    if (_.isFunction(cb)) {
      cursor.each((...arg) => cb(...arg));
    } else {
      return cursor;
    }
  }

  // * //////////////////////////////////////////////////////////////////////
  // * NETWORK

  async is_join_room() {
    await this.assert_user_exist();
    console.log(await users.get(this.userid).run())
    return users.get(this.userid)('rooms')
      .hasFields(this.roomid)
      .run();
  }
  async assert_is_join_room(msg?: string) {
    if (!(await this.is_join_room())) {
      throw new Error(msg || 'user is not member of the room');
    }
  }
  async do_join_room() {
    if (await this.is_join_room()) throw new Error('already joined');
    await users.get(this.userid)
      .update({
        rooms: { [this.roomid]: { latest: r.epochTime(0) } },
      })
      .run();
  }
  async do_left_room() {
    await this.assert_is_join_room();
    await users.get(this.userid)
      .update({ rooms: { [this.roomid]: r.literal() } } as any)
      .run();
  }
  async invite_friend_to_room(userid: string) {
    await this.assert_is_join_room();
    await this.user(userid).assert_user_exist();
    await this.user(userid).do_join_room();
  }

  // * //////////////////////////////////////////////////////////////////////
  // * CONNECTION

  // public close_connection() {
  //   return this.conn.close();
  // }
  // public get_database_name() {
  //   return this.conn['db'];
  // }
  // public set_database_name(db: string) {
  //   return this.conn.use(db);
  // }

  // * //////////////////////////////////////////////////////////////////////
  // * SCHEMAS

  // async ensure_schema() {
  //   await r
  //     .dbCreate(this.get_database_name())
  //     .run()
  //     .catch(_.noop);
  //   for (const t of ['users', 'rooms', 'messages']) {
  //     await r
  //       .tableCreate(t)
  //       .run()
  //       .catch(_.noop);
  //   }
  // }

  // async drop_database() {
  //   await r
  //     .dbDrop(this.get_database_name())
  //     .run()
  //     .catch(_.noop);
  // }

  // async reset_database() {
  //   await this.drop_database();
  //   await this.ensure_schema();
  // }
}
