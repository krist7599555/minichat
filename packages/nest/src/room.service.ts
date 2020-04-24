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
      const roomid = (await rethink.create_room(title)).id;
      await rethink.user(userid).room(roomid).do_join_room();
      await this.gateway.join_room(userid, roomid);
      await this.gateway.push_fetch_rooms(userid);
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
}
