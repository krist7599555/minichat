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
import { Server, Socket, Namespace } from 'socket.io';
import {
  RoomIO,
  MessageIO,
  AuthIO,
} from './app.gateway.model';
// import * as rethink from './rethinkdb';
import { UseFilters, Logger } from '@nestjs/common';
import { MinichatWsExceptionFilter } from './app.gateway.exception';
import Minichat, { get_rooms } from './minichat/minichat';
import * as cookie from 'cookie'
import { WsParamtype } from '@nestjs/websockets/enums/ws-paramtype.enum';
import { PipeTransform } from '@nestjs/common';
import { users, rooms, messages } from './rethinkdb/index';



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


@WebSocketGateway({
  path: '/socket.io',
})
@UseFilters(new MinichatWsExceptionFilter())
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('Socket');
  // eslint-disable-next-line @typescript-eslint/no-empty-function

  @WebSocketServer()
  private readonly server: Server;

  client(client_id) {
    return this.server.sockets.connected[client_id]
  }

  //* ////////////////////////////////////////////////////
  //* ROOMS

  async push_fetch_rooms(userid: string) {
    return this.client(userid).emit(IO_on_rooms, await get_rooms(userid));
  }

  async join_room(userid: string, roomid: string) {
    return this.client(userid)?.join(roomid);
  }

  async left_room(userid: string, roomid: string) {
    this.client(userid)?.leave(roomid);
    this.push_fetch_rooms(userid);
    for (const uid in this.server.to(roomid).connected) {
      this.push_fetch_rooms(uid);
    }
  }

  async room_invite(userid, roomid) {
    this.join_room(userid, roomid);
    this.push_fetch_rooms(userid);
    return true;
  }

  //* ////////////////////////////////////////////////////
  //* MESSAGES

  @SubscribeMessage<MinichatSocket>('create room:message')
  async _create_message(client: Socket, payload: MessageIO) {
    console.log('send_message', client.id, payload);
    return rethink
      .user(client.id)
      .room(payload.roomid)
      .create_message(payload.text);
  }

  @SubscribeMessage<MinichatSocket>('mark room:read')
  async _mark_as_read(client: Socket, payload: RoomIO) {
    this.logger.log(`read`, 'Room');
    return rethink
      .user(client.id)
      .room(payload.roomid)
      .mark_as_read();
  }

  //* ////////////////////////////////////////////////////
  //* HOOK

  async handleDisconnect(client: Socket) {
    this.logger.log('disconnected ' + client.id, 'Connection');
  }
  async handleConnection(@ConnectedSocket() client: Socket) {
    if (client.id === null) {
      client.disconnect()
    } else {
      this.logger.log('connected ' + client.id, 'Connection');
      const rooms = await users.get(client.id)('rooms').default({}).run()
      console.log(client.id, 'join', rooms)
      for (const room_id in rooms) {
        client.join(room_id);
      }
    }
  }

  //* ////////////////////////////////////////////////////
  //* WATCH

  async afterInit() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this.server.engine.generateId = function(req: Request) {
      const cook = cookie.parse(req.headers['cookie'] || '')
      return cook.minichat_id || cook.io || null
    }
    rethink.watch_messages(async (err, obj) => {
      console.log('message change', obj);
      this.logger.log('message is change', 'Watch');
      const msg = obj.new_val
      msg.user = await users.get(msg.userid).pluck('id', 'display_name').run()
      if (msg) {
        this.server.to(msg.roomid).emit(IO_on_message, msg);
      }
    });
    rethink.watch_rooms(async (err, obj) => {
      this.logger.log('rooms is change', 'Watch');
      for (const uid in this.server.to((obj.new_val || obj.old_val).id).connected) {
        this.push_fetch_rooms(uid);
      }
    });
  }


  //
  
}
