// * SOCKET CONSTANT
export const JOIN_ROOM = 'join_room';
export const LEFT_ROOM = 'left_room';
export const SEND_MESSAGE = 'send_message';
export const READ_MESSAGE = 'read_message';
export const ON_MESSAGE = 'on_message';
export const ROOMS = 'watch_rooms';
export const AUTH = 'auth_user';

export interface RoomIO {
  roomid: string;
}
export interface MessageIO {
  roomid: string;
  text: string;
  time?: Date;
}
export interface AuthIO {
  userid: string;
}
