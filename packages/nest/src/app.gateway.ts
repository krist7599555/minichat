import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import * as _ from 'lodash';
import { Server, Socket } from 'socket.io';
import {
  RoomIO,
  MessageIO,
} from './app.gateway.model';
// import * as rethink from './rethinkdb';
import { UseFilters, Logger } from '@nestjs/common';
import { MinichatWsExceptionFilter } from './app.gateway.exception';
import { get_rooms, create_message, mark_as_read,  watch_messages, watch_rooms, watch_users } from './minichat';
import * as cookie from 'cookie'
import { users } from './rethinkdb';



type MinichatSocket =
  | 'mark room:read'
  | 'create room:message'
  | 'on rooms'
  | 'on message';

const IO_on_rooms:   MinichatSocket = 'on rooms';
const IO_on_message: MinichatSocket = 'on message';


@WebSocketGateway({
  path: '/socket.io',
})
@UseFilters(new MinichatWsExceptionFilter())
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('Socket');

  @WebSocketServer()
  private readonly server: Server;

  client(client_id) {
    const res = this.server.sockets.connected[client_id]
    if (!res) throw new Error(`socket id ${client_id} is not exist. session may be expired`)
    return res;
  }

  async push_fetch_rooms(userid: string) {
    return this.client(userid).emit(IO_on_rooms, await get_rooms(userid));
  }

  async join_room(userid: string, roomid: string) {
    this.client(userid).join(roomid);
    this.push_fetch_rooms(userid);
  }

  async left_room(userid: string, roomid: string) {
    this.client(userid).leave(roomid);
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


  @SubscribeMessage<MinichatSocket>('create room:message')
  async _create_message(client: Socket, payload: MessageIO) {
    await create_message(client.id, payload.roomid, payload.text);
  }

  @SubscribeMessage<MinichatSocket>('mark room:read')
  async _mark_as_read(client: Socket, payload: RoomIO) {
    await mark_as_read(client.id, payload.roomid);
    return { message: "mark success" }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log('disconnected ' + client.id, 'Connection');
  }
  async handleConnection(@ConnectedSocket() client: Socket) {
    if (client.id === null || client.id == "null") {
      this.logger.log('bad connected ' + client.id, 'Connection');
      client.disconnect(true)
      
    } else {
      this.logger.log('connected ' + client.id, 'Connection');
      const rooms = await users.get(client.id)('rooms').default({}).run()
      for (const room_id in rooms) {
        client.join(room_id);
      }
    }
  }


  async afterInit() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this.server.engine.generateId = function(req: Request) {
      const cook = cookie.parse(req.headers['cookie'] || '')
      return cook.minichat_id || cook.io || null
    }

    watch_messages(async (err, obj) => {
      this.logger.log('message is change', 'Watch');
      const msg = obj.new_val
      msg.user = await users.get(msg.userid).pluck('id', 'display_name').run()
      if (msg) {
        this.server.to(msg.roomid).emit(IO_on_message, msg);
      }
    });
    watch_rooms(async (err, obj) => {
      this.logger.log('rooms is change', 'Watch');
      for (const uid in this.server.to((obj.new_val || obj.old_val).id).connected) {
        this.logger.log('push fetch to ' + uid, 'Emit');
        this.push_fetch_rooms(uid);
      }
    });
    watch_users(async (err, obj) => {
      this.logger.log('users is change', 'Watch');
      console.log(obj)
    });
  }
  
}
