import io from 'socket.io-client';
import { noop } from 'lodash';

const socket = io({ path: '/socket.io' });

export function on(event: string, fn: Function) {
  return socket.on(event, fn);
}
export function emit(event: string, payload: any, fn: Function = noop) {
  return socket.emit(event, payload, fn);
}

socket.on('connect', () => {
  console.log('vue is connect to socket');
});
