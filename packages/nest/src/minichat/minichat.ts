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
  }

  // * //////////////////////////////////////////////////////////////////////
  // * SETTER

  user(userid) {
    return assign(clone(this), { userid });
  }
  room(roomid) {
    return assign(clone(this), { roomid });
  }

  // * //////////////////////////////////////////////////////////////////////
  // * GETTER

  async get_user() {
    return USERS.get(this.userid).run(this.conn);
  }
  async get_rooms() {
    return ROOMS.run(this.conn);
  }
  async get_room_messages() {
    return MESSAGES.filter(msg => msg('roomid').eq(this.roomid)).run(this.conn);
  }
  async get_room_unread_messages() {
    const me = USERS.get(this.userid);
    return MESSAGES.filter(msg =>
      r.and(
        msg('roomid').eq(this.roomid),
        msg('time').gt(me('rooms')(this.roomid)('latest')),
      ),
    ).run(this.conn);
  }

  // * //////////////////////////////////////////////////////////////////////
  // * CREATER

  async create_user() {
    return USERS.insert({ userid: this.userid }, { conflict: 'error' }).run(
      this.conn,
    );
  }
  async create_room(title?: string) {
    return ROOMS.insert(_.pickBy({ id: this.roomid, title }), {
      conflict: 'error',
    }).run(this.conn);
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
        rooms: {
          [this.roomid]: {
            latest: r.epochTime(0),
            subscribe: true,
          },
        },
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
}
