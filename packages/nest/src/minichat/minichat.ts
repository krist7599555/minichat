import { r } from 'rethinkdb-ts';
import { User, Message, Room } from './minichat.interface';
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
    const u = await USERS.get(this.userid).run(this.conn);
    if (u) return u;
    else {
      console.error('not found');
      throw new Error('NOT FOUND');
    }
  }
  async get_users() {
    return USERS.run(this.conn);
  }
  async get_rooms() {
    return ROOMS.run(this.conn);
  }
  async get_rooms_auth() {
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
  async get_room_messages() {
    await this.set_room_reading_latest(); // update reading time
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

  // prettier-ignore
  async create_user(): Promise<User> {
    return await USERS
      .insert({ id: this.userid, rooms: {} }, { conflict: 'error', returnChanges: true })
      .run(this.conn)
      .then(wr => {
        if (wr.inserted) return wr.changes[0].new_val
        if (wr.errors) throw new Error(wr.first_error)
        throw wr;
      })
  }
  // prettier-ignore
  async create_room(title?: string): Promise<Room> {
    return await ROOMS.insert(_.pickBy({ id: this.roomid, title: title || r.uuid() }), { conflict: 'error', returnChanges: true })
      .run(this.conn)
      .then(wr => {
        if (wr.inserted) return wr.changes[0].new_val;
        if (wr.errors) throw new Error(wr.first_error);
        throw wr;
      });
  }
  async create_message(text: string) {
    if (await this.is_join_room()) {
      return MESSAGES.insert({
        userid: this.userid,
        roomid: this.roomid,
        time: r.now(),
        text,
      }).run(this.conn);
    }
  }

  // * //////////////////////////////////////////////////////////////////////
  // * READING

  async set_room_reading_latest() {
    return USERS.get(this.userid)
      .update({ rooms: { [this.roomid]: { latest: r.now() } } })
      .run(this.conn);
  }

  // * //////////////////////////////////////////////////////////////////////
  // * WATCHING

  async watch_rooms() {
    return ROOMS.changes().run(this.conn);
  }
  async watch_messages() {
    return MESSAGES.changes().run(this.conn);
  }

  // * //////////////////////////////////////////////////////////////////////
  // * NETWORK

  async is_join_room() {
    return USERS.get(this.userid)('rooms')
      .hasFields(this.roomid)
      .run(this.conn);
  }
  async do_join_room() {
    if (await this.is_join_room()) throw new Error('already joined');
    return USERS.get(this.userid)
      .update({
        rooms: { [this.roomid]: { latest: r.epochTime(0) } },
      })
      .run(this.conn);
  }
  async do_left_room() {
    if (await this.is_join_room()) {
      return USERS.get(this.userid)
        .update({ rooms: { [this.roomid]: r.literal() } })
        .run(this.conn);
    } else {
      throw new Error('can not left unjoined room');
    }
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

  // prettier-ignore
  async ensure_schema() {
    await r.dbCreate(this.get_database_name()).run(this.conn).catch(_.noop);
    for (const t of ['users', 'rooms', 'messages']) {
      await r.tableCreate(t).run(this.conn).catch(_.noop);
    }
  }
  // prettier-ignore
  async drop_database() {
    await r.dbDrop(this.get_database_name()).run(this.conn).catch(_.noop);
  }
  // prettier-ignore
  async reset_database() {
    await this.drop_database()
    await this.ensure_schema()
  }
}
