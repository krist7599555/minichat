import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);
import { ToastProgrammatic as Toast } from 'buefy';

// import { BehaviorSubject, Observable, Subject } from 'rxjs';
// import { scan, tap } from 'rxjs/operators';
import * as socket from './socket';
// import * as IO from './socket.model';
// import * as api from './api';
// // import { userid$ } from './auth';
import { reactive, toRefs } from '@vue/composition-api';

const state = reactive({
  rooms: [],
  roomid: null,
  messages: []
});
export const { rooms, roomid, messages } = toRefs(state);

export function mark_room_as_read(_roomid: string) {
  socket.emit('room:read', { roomid: _roomid }, ack => {
    console.log('set room reading to latest');
  });
}

export async function change_room(_roomid: string) {
  if (_roomid) {
    socket.emit('messages:get', { roomid: _roomid }, msgs => {
      state.roomid = _roomid;
      state.messages = msgs;
      mark_room_as_read(_roomid);
    });
  } else {
    state.roomid = null;
    state.messages = [];
  }
}

export function send_message(text: string) {
  if (text) {
    socket.emit('message:create', {
      roomid: state.roomid,
      text
    });
  }
}

export function create_room(title: string) {
  if (title) {
    socket.emit('room:create', { title }, room => {
      state.roomid = room.id;
      Toast.open({
        type: 'is-success',
        message: `room '${room.title}' was created`
      });
    });
  }
}

socket.on('rooms:changes', _rooms => {
  console.log('TCL: _rooms ', _rooms);
  state.rooms = _rooms;
});

socket.on('message:add', msg => {
  if (msg.roomid == state.roomid) {
    state.messages = [...state.messages, msg];
    mark_room_as_read(msg.roomid);
  }
  state.rooms = state.rooms.map(room => {
    console.log(room);
    if (room.id == msg.roomid) {
      if (room.id != state.roomid) {
        room.unreads += 1;
      } else {
        room.unreads += 0;
      }
      room.latest_message = msg.text;
    }
    return room;
  });
});
