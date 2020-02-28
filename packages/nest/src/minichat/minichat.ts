import { r } from 'rethinkdb-ts';
import { User, Message, Room, RoomExtend } from './minichat.interface';
import { Connection } from 'rethinkdb-ts';
import * as _ from 'lodash';

const USERS = r.table<User>('users');
const ROOMS = r.table<Room>('rooms');
const MESSAGES = r.table<Message>('messages');

// utils
let assign = Object.assign;
let clone = <T>(orig: T): T =>
  Object.assign(Object.create(Object.getPrototypeOf(orig)), orig);

export default class Minichat {
  private conn: Connection;
  private roomid?: string;
  private userid?: string;
  constructor(conn: Connection) {
    this.conn = conn;
    if (!conn)
      throw new Error('Minichat need rethinkdb.connection in constructure');
  }

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
    const u = await USERS.get(this.userid).run(this.conn);
    if (!u) throw new Error(`user ${this.userid} not exist`);
    return u;
  }
  async get_room() {
    if (!this.roomid) throw new Error('roomid is not set');
    const r = await USERS.get(this.roomid).run(this.conn);
    if (!r) throw new Error(`user ${this.roomid} not exist`);
    return r;
  }
  async assert_user_exist() {
    return this.get_user();
  }
  async get_users() {
    return USERS.run(this.conn);
  }
  async get_rooms() {
    return ROOMS.run(this.conn);
  }
  async set_room_title(title: string) {
    await this.assert_is_join_room();
    await ROOMS.get(this.roomid)
      .update({ title })
      .run(this.conn);
  }

  async get_rooms_auth(): Promise<RoomExtend[]> {
    const my_rooms = USERS.get(this.userid)('rooms');
    return ROOMS.map(room => {
      const is_joined = my_rooms(room('id')).default(false);
      return room.merge(
        is_joined.branch(
          {
            joined: true,
            unreads: MESSAGES.filter(msg =>
              r.and(
                msg('roomid').eq(room('id')),
                msg('time').gt(my_rooms(room('id'))('latest')),
              ),
            ).count(),
            latest_message: MESSAGES.filter(msg => msg('roomid').eq(room('id')))
              .max(msg => msg('time'))('text')
              .default(null),
          },
          { joined: false },
        ),
      );
    }).run(this.conn);
  }
  async get_joined_rooms_auth() {
    return _.filter(await this.get_rooms_auth(), {
      joined: true,
    });
  }

  async get_room_messages() {
    await this.mark_as_read(); // update reading time
    return MESSAGES.filter(msg => msg('roomid').eq(this.roomid))
      .orderBy(r.asc('time'))
      .run(this.conn);
  }
  async get_room_unread_messages() {
    const me = USERS.get(this.userid);
    return MESSAGES.filter(msg =>
      r.and(
        msg('roomid').eq(this.roomid),
        msg('time').gt(me('rooms')(this.roomid)('latest')),
      ),
    )
      .orderBy(r.asc('time'))
      .run(this.conn);
  }

  // * //////////////////////////////////////////////////////////////////////
  // * CREATER

  async create_user(): Promise<User> {
    return await USERS.insert(
      { id: this.userid, rooms: {} },
      { conflict: 'error', returnChanges: true },
    )
      .run(this.conn)
      .then(wr => {
        if (wr.inserted) return wr.changes[0].new_val;
        if (wr.errors) throw new Error(wr.first_error);
        throw wr;
      });
  }

  async create_room(title: string): Promise<Room> {
    return await ROOMS.insert(
      _.pickBy({ id: this.roomid, title: title || r.uuid() }),
      { conflict: 'error', returnChanges: true },
    )
      .run(this.conn)
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
    await MESSAGES.insert({
      userid: this.userid,
      roomid: this.roomid,
      time: r.now(),
      text,
    }).run(this.conn);
  }

  // * //////////////////////////////////////////////////////////////////////
  // * READING

  async mark_as_read() {
    await USERS.get(this.userid)
      .update({ rooms: { [this.roomid]: { latest: r.now() } } })
      .run(this.conn);
  }

  // * //////////////////////////////////////////////////////////////////////
  // * WATCHING

  async watch_rooms(cb = null) {
    const cursor = await ROOMS.changes().run(this.conn);
    if (_.isFunction(cb)) {
      cursor.each(() => cb(...arguments));
    } else {
      return cursor;
    }
  }
  async watch_messages(cb = null) {
    const cursor = await MESSAGES.changes().run(this.conn);
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
    return USERS.get(this.userid)('rooms')
      .hasFields(this.roomid)
      .run(this.conn);
  }
  async assert_is_join_room(msg?: string) {
    if (!(await this.is_join_room())) {
      throw new Error(msg || 'user is not member of the room');
    }
  }
  async do_join_room() {
    if (await this.is_join_room()) throw new Error('already joined');
    await USERS.get(this.userid)
      .update({
        rooms: { [this.roomid]: { latest: r.epochTime(0) } },
      })
      .run(this.conn);
  }
  async do_left_room() {
    await this.assert_is_join_room();
    await USERS.get(this.userid)
      .update({ rooms: { [this.roomid]: r.literal() } })
      .run(this.conn);
  }
  async invite_friend_to_room(userid: string) {
    await this.assert_is_join_room();
    await this.user(userid).assert_user_exist();
    await this.user(userid).do_join_room();
  }

  // * //////////////////////////////////////////////////////////////////////
  // * CONNECTION

  public close_connection() {
    return this.conn.close();
  }
  public get_database_name() {
    return this.conn['db'];
  }
  public set_database_name(db: string) {
    return this.conn.use(db);
  }

  // * //////////////////////////////////////////////////////////////////////
  // * SCHEMAS

  async ensure_schema() {
    await r
      .dbCreate(this.get_database_name())
      .run(this.conn)
      .catch(_.noop);
    for (const t of ['users', 'rooms', 'messages']) {
      await r
        .tableCreate(t)
        .run(this.conn)
        .catch(_.noop);
    }
  }

  async drop_database() {
    await r
      .dbDrop(this.get_database_name())
      .run(this.conn)
      .catch(_.noop);
  }

  async reset_database() {
    await this.drop_database();
    await this.ensure_schema();
  }

  async facade_init_user(cb = null) {
    await this.create_user()
      .then(() => this.create_and_join_room('myself'))
      .catch(_.noop);
    if (_.isFunction(cb)) {
      await this.watch_rooms().then(curser => {
        cb();
        curser.each(() => cb());
      });
    }
    return {
      self: await this.get_user(),
      rooms: await this.get_joined_rooms_auth(),
    };
  }
}
