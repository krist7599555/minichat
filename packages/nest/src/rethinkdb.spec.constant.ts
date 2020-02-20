import { r } from 'rethinkdb-ts';
import { Group, Message, User } from './rethinkdb.model';

export const DUMP_USERS: User[] = [
  { id: 'user-1', unreads: {} },
  { id: 'user-2', unreads: {} },
  { id: 'user-3', unreads: {} },
  { id: 'user-4', unreads: {} },
];

export const DUMP_GROUPS: Group[] = [
  { id: 'room-1', title: 'This is room 1' },
  { id: 'room-2', title: 'Room the second' },
  { id: 'room-3', title: 'Trilly Third' },
];

export const DUMP_MESSAGES: Message[] = [
  { userid: 'user-1', roomid: 'room-1', text: 'text-1', time: r.now() },
  { userid: 'user-2', roomid: 'room-1', text: 'text-2', time: r.now() },
  { userid: 'user-1', roomid: 'room-1', text: 'text-3', time: r.now() },
  { userid: 'user-1', roomid: 'room-1', text: 'text-4', time: r.now() },
  { userid: 'user-2', roomid: 'room-1', text: 'text-5', time: r.now() },
  { userid: 'user-2', roomid: 'room-1', text: 'text-6', time: r.now() },
  { userid: 'user-2', roomid: 'room-1', text: 'text-7', time: r.now() },
  { userid: 'user-3', roomid: 'room-2', text: 'text-8', time: r.now() },
  { userid: 'user-3', roomid: 'room-2', text: 'text-9', time: r.now() },
  { userid: 'user-1', roomid: 'room-2', text: 'text-10', time: r.now() },
  { userid: 'user-3', roomid: 'room-2', text: 'text-11', time: r.now() },
  { userid: 'user-1', roomid: 'room-2', text: 'text-12', time: r.now() },
  { userid: 'user-2', roomid: 'room-2', text: 'text-13', time: r.now() },
  { userid: 'user-2', roomid: 'room-2', text: 'text-14', time: r.now() },
];
