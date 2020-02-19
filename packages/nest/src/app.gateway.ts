import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

import { Socket, Server } from 'socket.io';

import * as _ from 'lodash';

import {
  ONLINE_USERS,
  SEND_MESSAGE,
  RECEIVE_MESSAGE,
  JOIN_ROOM,
  LEFT_ROOM,
  RECEIVE_MESSAGES,
  JoinRoomDto,
  SendMessageDto,
} from './app.gateway.model';

import { v4 as uuid } from 'uuid';

@WebSocketGateway({
  path: '/socket.io',
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private clients = new Set<string>();
  private messages: (SendMessageDto & { id: string })[] = [];
  private logger: Logger = new Logger('Socket');

  getMessages(roomid: string) {
    return _.filter(this.messages, { roomid });
  }

  @SubscribeMessage(JOIN_ROOM)
  join_room(client: Socket, payload: JoinRoomDto) {
    if (_.isString(payload.roomid)) {
      client.join(payload.roomid);
      client.emit(RECEIVE_MESSAGES, this.getMessages(payload.roomid));
      this.logger.log(client.id + ' join ' + payload.roomid, 'Socket Join');
    }
  }

  @SubscribeMessage(LEFT_ROOM)
  left_room(client: Socket, payload: JoinRoomDto) {
    if (_.isString(payload.roomid)) {
      client.leave(payload.roomid);
      this.logger.log(client.id + ' left ' + payload.roomid, 'Socket Left');
    }
  }

  @SubscribeMessage(SEND_MESSAGE)
  handleMessage(client: Socket, payload: SendMessageDto) {
    this.messages.push({ ...payload, id: uuid() });
    this.server.to(payload.roomid).emit(RECEIVE_MESSAGE, payload);
    this.logger.log(client.id, 'Socket Message');
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    this.server.emit(ONLINE_USERS, _.keys(this.clients));
    this.logger.log(client.id, 'Socket Disconnect');
  }

  handleConnection(client: Socket) {
    this.clients.add(client.id);
    this.server.emit(ONLINE_USERS, _.keys(this.clients));
    this.logger.log(client.id, 'Socket Connect');
  }
  afterInit() {}
}
