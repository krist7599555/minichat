import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as socket from './socket';
import * as IO from './socket.model';
import { userid$ } from './auth';

export const roomid$ = new BehaviorSubject<string | null>(null);
export const rooms$ = new Observable(observer => {
  socket.on(IO.ROOMS, rooms => observer.next(rooms));
});
export const message_emiter$ = new Subject();
export const messages$ = new BehaviorSubject<IO.MessageIO[]>([]);

export async function change_room(roomid: string) {
  if (roomid != roomid$.getValue()) {
    roomid$.next(null);
    socket.emit(IO.READ_MESSAGE, { roomid, userid: userid$.getValue() }, msgs => {
      console.log('TCL: functionread_message -> msgs', msgs);
      roomid$.next(roomid);
      messages$.next(null);
      messages$.next(msgs);
    });
  }
}

export function send_message(text: string) {
  socket.emit(IO.SEND_MESSAGE, {
    roomid: roomid$.getValue(),
    userid: userid$.getValue(),
    text
  });
}
