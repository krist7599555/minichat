import { RDatum } from 'rethinkdb-ts';

export interface ChatState {
  latest: Date;
  subscribe: Boolean;
}

export interface User {
  id: string;
  rooms: Record<string, ChatState> | any;
}
export interface Room {
  id: string;
  title: string;
}
export interface Message {
  userid: string;
  roomid: string;
  text: string;
  time: Date | RDatum<Date>;
}
