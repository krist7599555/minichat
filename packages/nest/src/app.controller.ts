import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
// import * as rethink from './rethinkdb';
import { RethinkdbService } from './rethinkdb/rethinkdb.service';

@Controller('/api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rethink: RethinkdbService,
  ) {}

  @Get()
  getAPI(): string {
    return 'NO API IMPLEMENT';
  }
  // @Get('users')
  // findUsers() {
  //   // return rethink.getUsers();
  // }
  // @Get('users/:userid/unreads')
  // getUnread(@Param('userid') userid: string) {
  //   // return rethink.getUserUnreadsMessage(userid);
  // }
  // @Get('users/:userid/unreads/:roomid')
  // getUnreadGroup(
  //   @Param('userid') userid: string,
  //   @Param('roomid') roomid: string,
  // ) {
  //   // return rethink.getUserUnreadsMessageGroup(userid, roomid);
  // }
  // @Post('users')
  // createUser(@Body() body) {
  //   if (body.id) {
  //     // return rethink.createUser(body);
  //   } else {
  //     throw new BadRequestException('need id to create user');
  //   }
  // }

  // @Get('groups')
  // findGroups() {
  //   // return rethink.getGroups();
  // }

  @Post('rooms')
  create_room(@Body() body) {
    if (body.title) {
      return this.rethink.create_room(body.title);
    } else {
      throw new BadRequestException('need title to create group');
    }
  }

  @Get('rooms/:roomid/messages')
  findGroupsMessages(@Param('roomid') roomid) {
    console.log('TCL: AppController -> findGroupsMessages -> roomid', roomid);
    return this.rethink.room(roomid).get_room_messages();
  }
}
