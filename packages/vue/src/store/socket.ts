import io from 'socket.io-client';
import { noop } from 'lodash';

const socket = io({ path: '/socket.io' });

export function on(event: string, fn: Function) {
  return socket.on(event, fn);
}
export function emit<T>(event: string, payload: T, fn: Function = noop) {
  return socket.emit(event, payload, fn);
}
export async function connected() {
  return new Promise(res => {
    if (socket.connected) res(true);
    else socket.on('connect', () => res(true));
  });
}

socket.on('exception', err => {
  console.error('SOCKET is exception');
  console.error(err);
});
