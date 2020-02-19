import io from 'socket.io-client';
import {
  SendMessageDto,
  SEND_MESSAGE,
  RECEIVE_MESSAGE,
  JOIN_ROOM,
  RECEIVE_MESSAGES
} from './socket.model';

const socket = io({
  path: '/socket.io'
});

export function on(event: string, fn: Function) {
  return socket.on(event, fn);
}
export function emit(event: string, ...payload: any[]) {
  return socket.emit(event, ...payload);
}

socket.on('connect', () => {
  console.log('vue connect to socket');
});
