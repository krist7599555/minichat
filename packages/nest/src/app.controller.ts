import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  All,
  Put,
  Delete,
} from '@nestjs/common';
import { AppService } from './app.service';
import { get_rooms } from './minichat';
import { users, reset } from './rethinkdb';
import { Response } from 'express'
import { AppGateway } from './app.gateway';
import { Id } from './decorator';
import { AuthService } from './auth.service';
import { RoomService } from './room.service';


@Controller('/api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly auth: AuthService,
    private readonly rooms: RoomService,
    private readonly gateway: AppGateway
  ) {

  }

  @Get()
  getAPI(): string {
    return 'NO API IMPLEMENT';
  }

  @Post('/login')
  async register(@Body() { username, password }, @Res() res: Response) {
    return this.auth.register({ username, password }, res);
  }
  
  @All("/logout") 
  logout(@Res() res: Response) {
    return this.auth.logout(res)
  }

  @Get("/profile")
  profile(@Id() id: string) {
    return this.auth.profile(id);
  }

  @Get("/users")
  _users() {
    return users.map(u => u.pluck('id', 'display_name')).run()
  }

  @Get('/rooms')
  _rooms(@Id() id: string) {
    return get_rooms(id)
  }

  @Get('/rooms/:roomid/messages')
  room_messages(@Id() id: string, @Param('roomid') roomid: string) {
    return this.rooms.get_room_messages(id, roomid);
  }

  @Post('/rooms')
  async create_room(@Id() id, @Body() {title}) {
    return this.rooms.create_room(id, title);
  }

  @Put('/rooms/:roomid/title/:title')
  put_room_title(@Param() {roomid, title}) {
    return this.rooms.update_room_title(roomid, title);
  }
  @Put('/rooms/:roomid/members/:userid')
  add_room_member(@Param() { roomid, userid }) {
    return this.rooms.add_room_member(roomid, userid);
  }
  @Delete('/rooms/:roomid/members/:userid')
  remove_room_member(@Param() { roomid, userid }) {
    return this.rooms.remove_room_member(roomid, userid);
  }


  @Get("/reset")
  async reset(@Res() res: Response) {
    await reset()
    res.redirect("/")
  }

}
