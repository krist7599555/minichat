import io from 'socket.io-client';
import { noop } from 'lodash';
import { ToastProgrammatic as Toast } from 'buefy';

const socket = io({ path: '/socket.io' });

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

export function on(event: MinichatSocket, fn: Function) {
  return socket.on(event, fn);
}
export function emit<T>(event: MinichatSocket, payload: T, fn: Function = noop) {
  return socket.emit(event, payload, fn);
}
export function get<T>(event: MinichatSocket, payload = null): Promise<T> {
  return new Promise(res => socket.emit(event, payload, res));
}

export async function connected() {
  return new Promise(res => {
    if (socket.connected) res(true);
    else socket.on('connect', () => res(true));
  });
}

socket.on('connect', () => {
  console.log('vue connect');
});
socket.on('exception', err => {
  console.error('SOCKET is exception');
  console.error(err);
  Toast.open({
    type: 'is-danger',
    message: err.message
  });
});
