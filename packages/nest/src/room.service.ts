import { Injectable, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { users, rooms } from './rethinkdb/index';
import { User } from './interface';
import { r } from 'rethinkdb-ts'
import Minichat from './minichat/minichat';
import { AppGateway } from './app.gateway';

const rethink = new Minichat()
@Injectable()
export class RoomService {
  constructor(private gateway: AppGateway) {}
  async create_room(userid: string, title: string) {
    if (title) {
      const room = await rethink.create_room(title);
      const roomid = room.id
      await rethink.user(userid).room(roomid).do_join_room();
      await this.gateway.join_room(userid, roomid);
      await this.gateway.push_fetch_rooms(userid);
      return room
    } else {
      throw new BadRequestException('need title to create group');
    }
  }
  async get_room_messages(userid, roomid) {
    return rethink
      .user(userid)
      .room(roomid)
      .get_room_messages();
  }
  async update_room_title(roomid, title) {
    return rooms.get(roomid).update({ title }).run()
  }
  async add_room_member(roomid, userid) {
    await rethink
      .user(userid)
      .room(roomid)
      .do_join_room()
    this.gateway.room_invite(userid, roomid);
  }
  async remove_room_member(roomid, userid) {
    await rethink
      .user(userid)
      .room(roomid)
      .do_left_room()
    this.gateway.left_room(userid, roomid);
  }
}
