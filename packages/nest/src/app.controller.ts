import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';

import { AppService } from './app.service';
import { creategroup } from './rethinkdb';
import {
  getusers,
  getgroups,
  getmessages,
  unreadmessage,
  createuser,
} from './rethinkdb';

@Controller('/api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'NO API IMPLEMENT';
  }
  @Get('users')
  findUsers() {
    return getusers();
  }
  @Get('users/:id/unreads')
  getUnread(@Param('id') userid: string) {
    return unreadmessage(userid);
  }
  @Post('users')
  createUser(@Body() body) {
    if (body.id) {
      return createuser(body);
    } else {
      throw new BadRequestException('need id to create user');
    }
  }

  @Get('groups')
  findGroups() {
    return getgroups();
  }
  @Get('groups')
  createGroups(@Body() body) {
    if (body.title) {
      return creategroup(body);
    } else {
      throw new BadRequestException('need title to create group');
    }
  }

  @Get('messages')
  findMessages() {
    return getmessages();
  }
}
