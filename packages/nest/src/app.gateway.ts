import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
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

@WebSocketGateway({
  path: '/socket.io',
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly auth: Record<string, string> = {};
  constructor(private readonly rethink: RethinkdbService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage(JOIN_ROOM)
  async join_room(client: Socket, payload: RoomIO) {
    return this.rethink
      .user(payload.userid)
      .room(payload.roomid)
      .do_join_room()
      .then(() => {
        client.join(payload.roomid);
      });
  }

  @SubscribeMessage(LEFT_ROOM)
  async left_room(client: Socket, payload: RoomIO) {
    return this.rethink
      .user(payload.userid)
      .room(payload.roomid)
      .do_left_room()
      .then(() => {
        client.leave(payload.roomid);
      });
  }

  @SubscribeMessage(SEND_MESSAGE)
  async send_message(client: Socket, payload: MessageIO) {
    return this.rethink
      .user(payload.userid)
      .room(payload.roomid)
      .create_message(payload.text);
  }
  @SubscribeMessage(READ_MESSAGE)
  async read_message(client: Socket, payload: RoomIO) {
    // return this.rethink
    //   .user(payload.userid)
    //   .room(payload.roomid)
    //   .do_join_room
  }

  @SubscribeMessage(AUTH)
  async auth_user(client: Socket, payload: AuthIO) {
    if (payload.userid) {
      this.auth[client.id] = payload.userid;
      const user = await this.rethink.user(payload.userid).get_user();
      for (const room of user.rooms) {
        client.join(room);
      }
    } else {
      this.auth[client.id] = payload.userid;
    }
    return {
      message: 'text ack',
    };
  }

  async handleDisconnect(client: Socket) {}
  async handleConnection(client: Socket) {
    this.server.emit(ROOMS, await this.rethink.get_rooms());
  }

  async afterInit() {
    await this.rethink.getConnection();
    const rooms_cursor = await this.rethink.watch_rooms();
    const messages_cursor = await this.rethink.watch_messages();
    rooms_cursor.each(async (err, room) => {
      console.log('rooms change', room);
      this.server.emit(ROOMS, await this.rethink.get_rooms());
    });
    messages_cursor.each((err, { old_val, new_val }) => {
      console.log('message change', new_val);
      this.server.to(new_val.roomid).emit(new_val);
    });
  }
}
