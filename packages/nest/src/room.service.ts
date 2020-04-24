import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { users, rooms } from './rethinkdb';
import { User } from './interface';
import { r } from 'rethinkdb-ts'

import { AppGateway } from './app.gateway';
import { get_room_messages, create_room, do_join_room, do_left_room } from './minichat';


@Injectable()
export class RoomService {
  constructor(private gateway: AppGateway) {}
  async create_room(userid: string, title: string) {
    console.log('create room')
    if (title) {
      const room = await create_room(title);
      const roomid = room.id
      await do_join_room(userid, roomid);
      await this.gateway.join_room(userid, roomid);
      await this.gateway.push_fetch_rooms(userid);
      return room
    } else {
      throw new BadRequestException('need title to create group');
    }
  }
  async get_room_messages(userid, roomid) {
    return get_room_messages(userid, roomid);
  }
  async update_room_title(roomid, title) {
    return rooms.get(roomid).update({ title }).run()
  }
  async add_room_member(roomid, userid) {
    await do_join_room(userid, roomid)
    this.gateway.room_invite(userid, roomid);
  }
  async remove_room_member(roomid, userid) {
    await do_left_room(userid, roomid);
    this.gateway.left_room(userid, roomid);
  }
}
