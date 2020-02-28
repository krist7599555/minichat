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

type MinichatSocket =
  | 'get rooms'
  | 'get room:messages'
  | 'put room:title'
  | 'mark room:read'
  | 'create room'
  | 'create room:message'
  | 'do room:join'
  | 'do room:leave'
  | 'do room:invite'
  | 'do auth:login'
  | 'do auth:logout'
  | 'on rooms'
  | 'on message';

const IO_on_rooms: MinichatSocket = 'on rooms';
const IO_on_message: MinichatSocket = 'on message';

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

  private async tell_user_to_fetch_rooms(client: Socket | string) {
    const clientid = _.isString(client) ? client : client.id;
    this.server
      .to(clientid)
      .emit(IO_on_rooms, await this.get_joined_rooms(client));
  }

  @SubscribeMessage<MinichatSocket>('do room:join')
  async join_room(client: Socket, payload: RoomIO) {
    return this.rethink
      .user(this.socket2userid(client))
      .room(payload.roomid)
      .do_join_room()
      .then(() => client.join(payload.roomid) && true);
  }

  @SubscribeMessage<MinichatSocket>('do room:leave')
  async left_room(client: Socket, payload: RoomIO) {
    this.logger.log(`leave`, 'Room');
    return this.rethink
      .user(this.socket2userid(client))
      .room(payload.roomid)
      .do_left_room()
      .then(async () => {
        client.leave(payload.roomid);
        this.tell_user_to_fetch_rooms(client);
        return true;
      });
  }

  //* ////////////////////////////////////////////////////
  //* MESSAGES

  @SubscribeMessage<MinichatSocket>('create room:message')
  async send_message(client: Socket, payload: MessageIO) {
    console.log('TCL: send_message -> payload', payload);
    return this.rethink
      .user(this.socket2userid(client))
      .room(payload.roomid)
      .create_message(payload.text);
  }

  @SubscribeMessage<MinichatSocket>('get room:messages')
  async get_messages(client: Socket, payload: RoomIO) {
    this.logger.log(`get`, 'Message');
    return this.rethink
      .user(this.socket2userid(client))
      .room(payload.roomid)
      .get_room_messages();
  }
  @SubscribeMessage<MinichatSocket>('put room:title')
  async put_room_title(client: Socket, payload: RoomIO & { title: string }) {
    this.logger.log(`title`, 'Room');
    return this.rethink
      .user(this.socket2userid(client))
      .room(payload.roomid)
      .set_room_title(payload.title);
  }

  @SubscribeMessage<MinichatSocket>('mark room:read')
  async mark_as_read(client: Socket, payload: RoomIO) {
    this.logger.log(`read`, 'Room');
    return this.rethink
      .user(this.socket2userid(client))
      .room(payload.roomid)
      .mark_as_read();
  }

  @SubscribeMessage<MinichatSocket>('do room:invite')
  async room_invite(client: Socket, { roomid, userid }: RoomIO & AuthIO) {
    this.logger.log(`invite`, 'Room');
    await this.rethink
      .user(this.socket2userid(client))
      .room(roomid)
      .invite_friend_to_room(userid);
    this.userid2clientid(userid).forEach(clientid =>
      this.tell_user_to_fetch_rooms(clientid),
    );
    return true;
  }

  @SubscribeMessage<MinichatSocket>('get rooms')
  async get_joined_rooms(client: Socket | string) {
    const clientid = _.isString(client) ? client : client.id;
    return await this.rethink
      .user(this.clientid2userid(clientid))
      .get_joined_rooms_auth();
  }

  //* ////////////////////////////////////////////////////
  //* AUTHENTICATION

  private clientid2userid(clientid: string) {
    if (this.auth.has(clientid)) {
      return this.auth.get(clientid);
    } else {
      throw new Error('socket not found user');
    }
  }
  private socket2userid(client: Socket) {
    return this.clientid2userid(client.id);
  }
  private userid2clientid(userid: string): string[] {
    const res = [];
    for (const [cid, uid] of this.auth) {
      if (uid == userid) {
        res.push(cid);
      }
    }
    return res;
  }

  @SubscribeMessage<MinichatSocket>('do auth:login')
  async auth_login(client: Socket, payload: AuthIO) {
    this.logger.log('user login');
    this.auth.set(client.id, payload.userid);
    const { self, rooms } = await this.rethink
      .user(payload.userid)
      .facade_init_user(() => this.tell_user_to_fetch_rooms(client));
    rooms.forEach(room => client.join(room.id));
    return self;
  }

  @SubscribeMessage<MinichatSocket>('do auth:logout')
  async auth_logout(client: Socket) {
    this.logger.log('user logout');
    this.auth.delete(client.id);
    return true;
  }

  @SubscribeMessage<MinichatSocket>('create room')
  async create_room(client: Socket, payload: any) {
    return await this.rethink
      .user(this.socket2userid(client))
      .create_and_join_room(payload.title)
      .then(async room => {
        client.join(room.id);
        await this.tell_user_to_fetch_rooms(client);
        return room;
      });
  }

  //* ////////////////////////////////////////////////////
  //* HOOK

  async handleDisconnect(client: Socket) {
    this.auth.delete(client.id);
    this.logger.log('disconnect', 'Connection');
  }
  async handleConnection(client: Socket) {
    this.logger.log('connect', 'Connection');
  }

  //* ////////////////////////////////////////////////////
  //* WATCH

  async afterInit() {
    this.rethink.watch_messages(async (err, obj) => {
      this.logger.log('message is change', 'Watch');
      this.server.to(obj.new_val.roomid).emit(IO_on_message, obj.new_val);
    });
    this.rethink.watch_rooms(async (err, obj) => {
      this.logger.log('rooms is change', 'Watch');
    });
  }
}
