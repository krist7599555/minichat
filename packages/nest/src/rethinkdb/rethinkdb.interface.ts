import { RDatum } from 'rethinkdb-ts';

export interface ChatState {
  latest: Date;
  subscribe: boolean;
}

export interface User {
  id: string;
  rooms: Record<string, ChatState>;
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
