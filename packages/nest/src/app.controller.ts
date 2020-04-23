import * as _ from 'lodash'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  All,
} from '@nestjs/common';
import { AppService } from './app.service';
// import * as rethink from './rethinkdb';
import Minichat from './minichat/minichat';
import { users } from './rethinkdb/index';
import { Response } from 'express'
import { User } from './rethinkdb/rethinkdb.interface';

const rethink = new Minichat();

@Controller('/api')
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  getAPI(): string {
    return 'NO API IMPLEMENT';
  }

  @Post('/login')
  async register(@Body() {username, password}, @Res() res: Response) {
    if (!username) throw new BadRequestException("username is required")
    if (!password) throw new BadRequestException("password is required")
    
    let usr: User = await users.filter({ username }).nth(0).run().catch(e => null)
    if (usr && usr.password != password) {
      throw new BadRequestException("username or password is wrong");
    }
    if (!usr) {
      const wr = await users.insert(
        { username, password, display_name: username }, 
        { returnChanges: true }
      ).run()
      usr = wr.changes[0].new_val;
      res.cookie('minichat_id', usr.id);
      res.status(201).send({ message: "register success" })
    } else {
      res.cookie('minichat_id', usr.id);
      res.status(200).send({ message: "login success" })
    } 
  }
  
  @All("/logout") 
  logout(@Res() res: Response) {
    res.cookie('minichat_id', null);
    res.status(200).send({ message: "logout success" })
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
      return rethink.create_room(body.title);
    } else {
      throw new BadRequestException('need title to create group');
    }
  }

  @Get('rooms/:roomid/messages')
  findGroupsMessages(@Param('roomid') roomid) {
    console.log('TCL: AppController -> findGroupsMessages -> roomid', roomid);
    return rethink.room(roomid).get_room_messages();
  }
}
