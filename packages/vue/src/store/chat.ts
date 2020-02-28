import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);
import { ToastProgrammatic as Toast } from 'buefy';
import * as socket from './socket';
import { watch, computed } from '@vue/composition-api';
import { reactive, toRefs } from '@vue/composition-api';
import * as auth from './auth';
import * as _ from 'lodash';

interface Room {
  id: string;
  title: string;
  joined: boolean;
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

const state = reactive({
  rooms: [] as Room[],
  roomid: null as string | null,
  messages: [] as Message[]
});

export const { rooms, roomid, messages } = toRefs(state);
export const currentRoom = computed(() => {
  console.log(state);
  return _.find(rooms.value, { id: roomid.value });
});

export async function mark_room_as_read() {
  await socket.get('mark room:read', { roomid: state.roomid });
  state.rooms = state.rooms.filter(room => {
    if (room.id == state.roomid) {
      room.unreads = 0;
    }
    return room;
  });
}

export async function change_room(roomid: string | null) {
  state.roomid = roomid;
}
export async function change_room_title(title: string) {
  if (title) {
    await socket.get('put room:title', { roomid: state.roomid, title });
  }
}

export async function send_message(text: string) {
  if (text && state.roomid) {
    await socket.get('create room:message', { roomid: state.roomid, text });
  }
}

export async function create_room(title: string) {
  if (title) {
    const room = await socket.get<Room>('create room', { title });
    state.roomid = room.id;
    Toast.open({
      type: 'is-success',
      message: `room '${room.title}' was created`
    });
  }
}

export async function add_friend_to_room(userid: string) {
  await socket.get<Room>('do room:invite', { userid, roomid: roomid.value });
  Toast.open({
    type: 'is-success',
    message: `invited ${userid}`
  });
}
export async function room_leave() {
  await socket.get<Room>('do room:leave', { roomid: roomid.value });
  Toast.open({
    type: 'is-success',
    message: `leave group`
  });
}

socket.on('on rooms', _rooms => {
  state.rooms = _rooms;
});

socket.on('on message', async msg => {
  // left side
  state.rooms = state.rooms.map(room => {
    if (room.id == msg.roomid) {
      if (room.id != state.roomid) {
        room.unreads += 1;
      } else {
        room.unreads = 0;
      }
      room.latest_message = msg.text;
    }
    return room;
  });
  // right side
  if (msg.roomid == state.roomid) {
    state.messages = [...state.messages, msg];
    await mark_room_as_read();
  }
});

watch(
  () => auth.userid.value,
  async uid => {
    if (uid) {
      state.rooms = await socket.get<Room[]>('get rooms');
    } else {
      state.roomid = null;
      state.rooms = [];
    }
  }
);
watch(
  () => roomid.value,
  async rid => {
    if (rid) {
      state.messages = await socket.get<Message[]>('get room:messages', { roomid: rid });
      await mark_room_as_read();
    } else {
      state.messages = [];
    }
  }
);
