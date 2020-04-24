import io from 'socket.io-client';
import { noop } from 'lodash';
import { ToastProgrammatic as Toast } from 'buefy';
import { BehaviorSubject } from 'rxjs';

const socket = io({
  path: '/socket.io',
  reconnection: true,
  autoConnect: false,
  transports: ['websocket']
});

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
// export const disconnect = () => socket.disconnect()
// export const close = () => socket.close()
export const connect = () => socket.connect()
// export const set_reconnection = (b: boolean) => socket.io.reconnection(false)
// export const get_reconnection = () => socket.io.reconnection()
// export const connected = () => socket.connected
// export const disconnected = () => socket.disconnected
export const open = () => socket.open()
export const io_status$ = new BehaviorSubject(false);

socket.on('connect', () => {
  io_status$.next(true)
  console.log('vue connect');
});
socket.on('disconnect', () => {
  io_status$.next(false)
  console.log('vue dis connect');
  // socket.open();
});
socket.on('exception', err => {
  console.error('SOCKET is exception');
  console.error(err);
  Toast.open({
    type: 'is-danger',
    message: err.message
  });
});
socket.on('error', err => {
  console.error('SOCKET is error');
  console.error(err);
  Toast.open({
    type: 'is-danger',
    message: err.message
  });
});
