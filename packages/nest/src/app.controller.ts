import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';

import { AppService } from './app.service';
import { createGroup } from './rethinkdb';
import {
  getUsers,
  getGroups,
  getMessages,
  getUserUnreadsMessage,
  createUser,
} from './rethinkdb';

@Controller('/api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getAPI(): string {
    return 'NO API IMPLEMENT';
  }
  @Get('users')
  findUsers() {
    return getUsers();
  }
  @Get('users/:id/unreads')
  getUnread(@Param('id') userid: string) {
    return getUserUnreadsMessage(userid);
  }
  @Post('users')
  createUser(@Body() body) {
    if (body.id) {
      return createUser(body);
    } else {
      throw new BadRequestException('need id to create user');
    }
  }

  @Get('groups')
  findGroups() {
    return getGroups();
  }
  @Get('groups')
  createGroups(@Body() body) {
    if (body.title) {
      return createGroup(body);
    } else {
      throw new BadRequestException('need title to create group');
    }
  }

  @Get('messages')
  findMessages() {
    return getMessages();
  }
}
