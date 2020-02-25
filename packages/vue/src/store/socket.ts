import io from 'socket.io-client';
import { noop } from 'lodash';
import { ToastProgrammatic as Toast } from 'buefy';

const socket = io({ path: '/socket.io' });

export function on(event: string, fn: Function) {
  return socket.on(event, fn);
}
export function emit<T>(event: string, payload: T, fn: Function = noop) {
  return socket.emit(event, payload, fn);
}
export function get<T>(event: string, payload = null): Promise<T> {
  return new Promise(res => socket.emit(event, payload, res));
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
  Toast.open({
    type: 'is-danger',
    message: err.message
  });
});
