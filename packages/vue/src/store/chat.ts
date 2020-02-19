import { BehaviorSubject } from 'rxjs';
import { SendMessageDto } from '../../../nest/dist/app.gateway.model';
import {
  JOIN_ROOM,
  RECEIVE_MESSAGE,
  SEND_MESSAGE,
  RECEIVE_MESSAGES
} from '../../../nest/src/app.gateway.model';
import { userid } from './auth';
import { emit, on } from './socket';

export interface Group {
  id: string;
  image: string;
  title: string;
  member: number;
}
export interface Message {
  text: string;
  userid: string;
  id: string;
  roomid: string;
}

export const roomid$ = new BehaviorSubject<string | null>(null);

export const rooms$ = new BehaviorSubject<Group[]>([
  { id: '694c258f2', image: 'coffee', title: 'Best Coffee Group', member: 13 },
  { id: '9a3b6c9bb', image: 'fish', title: 'Chula Eng CP44', member: 96 },
  { id: '33075ecff', image: 'home', title: '2110101 comprog', member: 333 },
  { id: '06c12ed2c', image: 'sun', title: 'HORA today', member: 2 }
]);

export const messages$ = new BehaviorSubject<Message[]>([]);

on(RECEIVE_MESSAGE, (msg: Message) => {
  messages$.next([...messages$.value, msg]);
});
on(RECEIVE_MESSAGES, (msgs: Message[]) => {
  messages$.next(msgs);
});

export async function changeroom(roomid: string) {
  roomid$.next(roomid);
  emit(JOIN_ROOM, { roomid });
}

export function send(text: string) {
  const u = userid();
  if (roomid$.value && u) {
    emit(SEND_MESSAGE, {
      text,
      roomid: roomid$.value,
      userid: u
    } as SendMessageDto);
  }
}
