import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  BaseWsExceptionFilter,
} from '@nestjs/websockets';
import * as _ from 'lodash';
import { Server, Socket } from 'socket.io';
import {
  JOIN_ROOM,
  LEFT_ROOM,
  ROOMS,
  SEND_MESSAGE,
  RoomIO,
  MessageIO,
  AUTH,
  AuthIO,
  READ_MESSAGE,
} from './app.gateway.model';
// import * as rethink from './rethinkdb';
import { RethinkdbService } from './rethinkdb/rethinkdb.service';
import { ON_MESSAGE } from './app.gateway.model';
import { UseFilters, Logger } from '@nestjs/common';
import { MinichatWsExceptionFilter } from './app.gateway.exception';

@WebSocketGateway({
  path: '/socket.io',
})
@UseFilters(new MinichatWsExceptionFilter())
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('Socket');
  constructor(private readonly rethink: RethinkdbService) {}

  @WebSocketServer()
  private readonly server: Server;
  private readonly auth = new Map<string, string>();

  //* ////////////////////////////////////////////////////
  //* ROOMS

  @SubscribeMessage('room:join')
  async join_room(client: Socket, payload: RoomIO) {
    return this.rethink
      .user(this.get_auth(client.id))
      .room(payload.roomid)
      .do_join_room()
      .then(() => {
        client.join(payload.roomid);
      });
  }

  @SubscribeMessage('room:left')
  async left_room(client: Socket, payload: RoomIO) {
    return this.rethink
      .user(this.get_auth(client.id))
      .room(payload.roomid)
      .do_left_room()
      .then(() => {
        client.leave(payload.roomid);
      });
  }

  //* ////////////////////////////////////////////////////
  //* MESSAGES

  @SubscribeMessage('message:create')
  async send_message(client: Socket, payload: MessageIO) {
    return this.rethink
      .user(this.get_auth(client.id))
      .room(payload.roomid)
      .create_message(payload.text);
  }

  @SubscribeMessage('messages:get')
  async get_messages(client: Socket, payload: RoomIO) {
    return this.rethink
      .user(this.get_auth(client.id))
      .room(payload.roomid)
      .get_room_messages();
  }
  @SubscribeMessage('room:read')
  async mark_as_read(client: Socket, payload: RoomIO) {
    return this.rethink
      .user(this.get_auth(client.id))
      .room(payload.roomid)
      .set_room_reading_latest();
  }

  //* ////////////////////////////////////////////////////
  //* AUTHENTICATION
  private get_auth(client_id: string) {
    if (this.auth.has(client_id)) {
      return this.auth.get(client_id);
    } else {
      throw new Error('NOT AUTH SOCKET');
    }
  }

  @SubscribeMessage('user:login')
  async set_auth(client: Socket, payload: AuthIO) {
    if (payload && payload.userid) {
      this.logger.log('user login');
      this.auth.set(client.id, payload.userid);
      const me = this.rethink.user(payload.userid);
      await me.create_user().catch(_.noop);
      const rooms = await me.get_rooms_auth();
      for (const room of _.filter(rooms, 'joined')) {
        console.log('user', payload.userid, 'join', room.title);
        client.join(room.id);
      }
      client.emit('rooms:changes', rooms);
      (await this.rethink.watch_rooms()).each(async (err, res) => {
        client.emit('rooms:changes', await me.get_rooms_auth());
      });
      return await me.get_user();
    } else {
      this.logger.log('user logout');
      this.auth.delete(client.id);
      return {
        message: 'sign out',
      };
    }
  }

  @SubscribeMessage('room:create')
  async room_create(client: Socket, payload: any) {
    const me = this.rethink.user(this.get_auth(client.id));
    const room = await me.create_room(payload.title);
    await me.room(room.id).do_join_room();
    client.emit('rooms:changes', await me.get_rooms_auth());
    return room;
  }

  //* ////////////////////////////////////////////////////
  //* HOOK
  async handleDisconnect(client: Socket) {
    this.auth.delete(client.id);
  }
  async handleConnection(client: Socket) {}

  //* ////////////////////////////////////////////////////
  //* WATCH

  async afterInit() {
    (await this.rethink.watch_messages()).each(async (err, { new_val }) => {
      this.logger.log('message is change ' + new_val);
      this.server.to(new_val.roomid).emit('message:add', new_val);
    });
    (await this.rethink.watch_rooms()).each(async (err, { new_val }) => {
      this.logger.log('rooms is change');
    });
  }

  //* ////////////////////////////////////////////////////
  //* ERROR

  @SubscribeMessage('error')
  async on_error(client: Socket, payload: AuthIO) {}
}
