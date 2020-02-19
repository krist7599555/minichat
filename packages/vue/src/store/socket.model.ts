export const JOIN_ROOM = 'join_room';
export const LEFT_ROOM = 'left_room';
export const SEND_MESSAGE = 'send_message';
export const RECEIVE_MESSAGE = 'send_message';
export const RECEIVE_MESSAGES = 'send_messages';

export interface JoinRoomDto {
  roomid: string;
}
export interface LeftRoomDto {
  roomid: string;
}
// prettier-ignore
export interface SendMessageDto {
  roomid: string;
  userid: string;
  text:   string;
}
// prettier-ignore
export interface ReceiveMessageDto {
  roomid: string;
  userid: string;
  text:   string;
}
