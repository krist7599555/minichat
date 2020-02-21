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

@Controller('/api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getAPI(): string {
    return 'NO API IMPLEMENT';
  }
  @Get('users')
  findUsers() {
    // return rethink.getUsers();
  }
  @Get('users/:userid/unreads')
  getUnread(@Param('userid') userid: string) {
    // return rethink.getUserUnreadsMessage(userid);
  }
  @Get('users/:userid/unreads/:roomid')
  getUnreadGroup(
    @Param('userid') userid: string,
    @Param('roomid') roomid: string,
  ) {
    // return rethink.getUserUnreadsMessageGroup(userid, roomid);
  }
  @Post('users')
  createUser(@Body() body) {
    if (body.id) {
      // return rethink.createUser(body);
    } else {
      throw new BadRequestException('need id to create user');
    }
  }

  @Get('groups')
  findGroups() {
    // return rethink.getGroups();
  }

  @Post('groups')
  createGroups(@Body() body) {
    if (body.title) {
      // return rethink.createGroup(body.title);
    } else {
      throw new BadRequestException('need title to create group');
    }
  }

  @Get('messages')
  findMessages() {
    // return rethink.getMessages();
  }
  @Get('messages/:roomid')
  findGroupsMessages(@Param('roomid') roomid) {
    // return rethink.getGroupsMessages(roomid);
  }
}
