import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);
import { ToastProgrammatic as Toast } from 'buefy';
import * as socket from './socket';
import { ref } from '@vue/composition-api';
import * as auth from './auth';
import * as _ from 'lodash';
import axios from 'axios';
import { BehaviorSubject, Subject, merge, from } from 'rxjs';
import { flatMap, scan, filter, pluck, withLatestFrom, map, tap } from 'rxjs/operators';

interface Room {
  id: string;
  title: string;
  unreads: number;
  latest_message: string | null;
}
interface Message {
  id: string;
  userid: string;
  roomid: string;
  text: string;
  time?: string | Date;
}


const rooms_emitter$ = new Subject<Room[]>();

const raw_rooms$ = auth.user$.pipe(
  flatMap(usr => usr ? from(axios.get<Room[]>("/api/rooms").then(res => res.data)) : [])
)
raw_rooms$.subscribe(rooms_emitter$)

export const roomid$ = new BehaviorSubject<string>(null);
const message_emitter$ = new Subject<Message>();
const message_read_emitter$ = new Subject<string>();
const message_read$ = message_read_emitter$.pipe(map(roomid => ({ roomid, unreads: 0 })))
export const rooms$ = merge(rooms_emitter$, message_emitter$, message_read$).pipe(
  scan<Room[] | Message, Room[]>((acc, inp) => {
    return _.isArray(inp) ? inp : _.map(acc, room => {
      return _.assign(room, inp.roomid == room.id ? { time: inp.time, text: inp.text, latest_message: inp.text } : {})
    })
  }, []),
  map(rooms => _.sortBy(rooms, 'time'))
)

const message_insert$ = message_emitter$.pipe(
  withLatestFrom(roomid$),
  filter(([m, roomid]) => m.roomid == roomid),
  pluck(0)
)
const messages_block$ = roomid$.pipe(
  filter(_.identity),
  flatMap(roomid => axios.get(`/api/rooms/${roomid}/messages`)),
  pluck('data'),
)

export const messages$ = merge(message_insert$, messages_block$).pipe(
  tap(console.log),
  scan((acc, inc) => _.isArray(inc) ? inc : [...acc, inc], [])
)


export const rooms    = ref<Room[]>([]);
export const roomid   = ref<string | null>(null);
export const messages = ref<Message[]>([]);

rooms$.subscribe(v => rooms.value = v);
roomid$.subscribe(v => roomid.value = v);
messages$.subscribe(v => messages.value = v);

export async function mark_room_as_read() {
  await socket.get('mark room:read', { roomid: roomid.value });
  message_read_emitter$.next(roomid.value)
}

export async function change_room(roomid: string | null) {
  roomid$.next(roomid)
}
export async function change_room_title(title: string) {
  if (title) {
    await socket.get('put room:title', { roomid: roomid.value, title });
  }
}

export async function send_message(text: string) {
  if (text && roomid.value) {
    await socket.get('create room:message', { roomid: roomid.value, text });
  }
}


// shoudle be http
export async function create_room(title: string) {
  return axios.post<Room>("/api/rooms", { title })
    .then(res => res.data)
    .then(room => {
      Toast.open({
        type: 'is-success',
        message: `room '${room.title}' was created`
      });
      roomid$.next(room.id);
      return room;
    })
}

export async function add_friend_to_room(userid: string) {
  return axios.put(`/api/rooms/${roomid.value}/members/${userid}`)
    .then(res => {
      Toast.open({
        type: 'is-success',
        message: `invited ${userid}`
      });
      return res;
    })
}

export async function room_leave() {
  return axios.delete(`/api/rooms/${roomid.value}/members/${auth.user.id}`)
    .then(res => {
      Toast.open({
        type: 'is-success',
        message: `leave group`
      });
      roomid$.next(null)
      return res;
    })
}

socket.on('on rooms', new_rooms => {
  rooms_emitter$.next(new_rooms)
});

socket.on('on message', async msg => {
  message_emitter$.next(msg);
});

// watch(
//   () => auth.userid.value,
//   async uid => {
//     if (uid) {
//       state.rooms = await socket.get<Room[]>('get rooms');
//     } else {
//       roomid.value = null;
//       state.rooms = [];
//     }
//   }
// );
// watch(
//   () => roomid.value,
//   async rid => {
//     if (rid) {
//       state.messages = await socket.get<Message[]>('get room:messages', { roomid: rid });
//       await mark_room_as_read();
//     } else {
//       state.messages = [];
//     }
//   }
// );
