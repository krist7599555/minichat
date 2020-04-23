import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  BaseWsExceptionFilter,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { createWsParamDecorator } from '@nestjs/websockets/utils/param.utils';
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
import { ON_MESSAGE } from './app.gateway.model';
import { UseFilters, Logger, Req } from '@nestjs/common';
import { MinichatWsExceptionFilter } from './app.gateway.exception';
import Minichat from './minichat/minichat';
// import cookieParser from 'cookie-parser';
// import * as cookiejar from 'cookiejar'
import * as cookie from 'cookie'
import { WsParamtype } from '@nestjs/websockets/enums/ws-paramtype.enum';
import { PipeTransform } from '@nestjs/common';



function client2cookie(client: Socket) {
  const hcookie = client.handshake.headers["cookie"];
  return cookie.parse(hcookie || '')
}

const Cookie = (field?: string) => createWsParamDecorator(WsParamtype.SOCKET)(
  { transform: client2cookie }, 
  { transform: cookie => field ? cookie[field] : cookie }
)



// const c = '_ga=GA1.1.1813147253.1557460256; minichat_id=3b2991bd-6f9d-42da-b67c-69564b0e359c; io=y-b958ADQJYAWo8FAAAA'
// console.log(cookie.parse(''))
// /minichat_id=(*);/
// console.log(new cookiejar.Cookie(c).toString())

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

const rethink = new Minichat();

// declare type ParameterDecorator = (target: Record<string, any>, propertyKey: string | symbol, parameterIndex: number) => void;

// const CookiePD = createWsParamDecorator(WsParamtype.SOCKET)
// ParameterDecorator = (target, key, idx) => {
//   console.log([target, key, idx])
// }

@WebSocketGateway({
  path: '/socket.io',
})
@UseFilters(new MinichatWsExceptionFilter())
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('Socket');
  // eslint-disable-next-line @typescript-eslint/no-empty-function

  @WebSocketServer()
  private readonly server: Server;

  //* ////////////////////////////////////////////////////
  //* ROOMS

  private async tell_user_to_fetch_rooms(client_id: string) {
    this.server
      .to(client_id)
      .emit(IO_on_rooms, await this.get_joined_rooms({id: client_id} as Socket));
  }

  @SubscribeMessage<MinichatSocket>('do room:join')
  async join_room(client: Socket, payload: RoomIO) {
    return rethink
      .user(client.id)
      .room(payload.roomid)
      .do_join_room()
      .then(() => client.join(payload.roomid) && true);
  }

  @SubscribeMessage<MinichatSocket>('do room:leave')
  async left_room(client: Socket, payload: RoomIO) {
    this.logger.log(`leave`, 'Room');
    return rethink
      .user(client.id)
      .room(payload.roomid)
      .do_left_room()
      .then(async () => {
        client.leave(payload.roomid);
        this.tell_user_to_fetch_rooms(client.id);
        return true;
      });
  }

  //* ////////////////////////////////////////////////////
  //* MESSAGES

  @SubscribeMessage<MinichatSocket>('create room:message')
  async send_message(client: Socket, payload: MessageIO) {
    console.log('send_message', client.id, payload);
    return rethink
      .user(client.id)
      .room(payload.roomid)
      .create_message(payload.text);
  }

  @SubscribeMessage<MinichatSocket>('get room:messages')
  async get_messages(client: Socket, payload: RoomIO) {
    this.logger.log(`get`, 'Message');
    return rethink
      .user(client.id)
      .room(payload.roomid)
      .get_room_messages();
  }
  @SubscribeMessage<MinichatSocket>('put room:title')
  async put_room_title(client: Socket, payload: RoomIO & { title: string }) {
    this.logger.log(`title`, 'Room');
    return rethink
      .user(client.id)
      .room(payload.roomid)
      .set_room_title(payload.title);
  }

  @SubscribeMessage<MinichatSocket>('mark room:read')
  async mark_as_read(client: Socket, payload: RoomIO) {
    this.logger.log(`read`, 'Room');
    return rethink
      .user(client.id)
      .room(payload.roomid)
      .mark_as_read();
  }

  @SubscribeMessage<MinichatSocket>('do room:invite')
  async room_invite(client: Socket, { roomid, userid }: RoomIO & AuthIO) {
    this.logger.log(`invite`, 'Room');
    await rethink
      .user(client.id)
      .room(roomid)
      .invite_friend_to_room(userid);
    
    this.tell_user_to_fetch_rooms(userid);
    return true;
  }

  @SubscribeMessage<MinichatSocket>('get rooms')
  async get_joined_rooms(client: Socket) {
    return await rethink
      .user(client.id)
      .get_joined_rooms_auth();
  }

  //* ////////////////////////////////////////////////////
  //* AUTHENTICATION

  @SubscribeMessage<MinichatSocket>('do auth:login')
  async auth_login(client: Socket, payload: AuthIO) {
    this.logger.log('user login');
    const { self, rooms } = await rethink
      .user(client.id)
      .facade_init_user(() => this.tell_user_to_fetch_rooms(client.id));
    rooms.forEach(room => client.join(room.id));
    return self;
  }

  @SubscribeMessage<MinichatSocket>('do auth:logout')
  async auth_logout(client: Socket) {
    throw new Error("logout is deprecate")
    return true;
  }

  @SubscribeMessage<MinichatSocket>('create room')
  async create_room(client: Socket, payload: any) {
    return await rethink
      .user(client.id)
      .create_and_join_room(payload.title)
      .then(async room => {
        client.join(room.id);
        await this.tell_user_to_fetch_rooms(client.id);
        return room;
      });
  }

  //* ////////////////////////////////////////////////////
  //* HOOK

  async handleDisconnect(client: Socket) {
    this.logger.log('disconnected ' + client.id, 'Connection');
  }
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log('connected ' + client.id, 'Connection');
  }

  //* ////////////////////////////////////////////////////
  //* WATCH

  async afterInit() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this.server.engine.generateId = function(req: Request) {
      const cook = cookie.parse(req.headers['cookie'] || '')
      return cook.minichat_id || cook.io || 'someone'
    }
    rethink.watch_messages(async (err, obj) => {
      this.logger.log('message is change', 'Watch');
      const msg = obj.new_val
      if (msg) {
        this.server.to(msg.roomid).emit(IO_on_message, msg);
      }
    });
    rethink.watch_rooms(async (err, obj) => {
      this.logger.log('rooms is change', 'Watch');
    });
  }
}
