import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);

import { BehaviorSubject, Observable, Subject } from 'rxjs';
// import { map } from 'rxjs/operators';

import { reactive, toRefs, ref, computed } from '@vue/composition-api';

import router from '../router';
import * as socket from './socket';
// import * as IO from './socket.model';
// // import * as _ from 'lodash';
const AUTH_TOKEN = 'token';

export const userid = ref<string>(null);

async function authentication(_userid: string | null) {
  console.log('sock <');
  await socket.connected();
  console.log('sock >');
  console.log('authenticate', userid);
  socket.emit('user:login', _userid ? { userid: _userid } : null, user => {
    console.log('TCL: authentication -> user', user);
    if (user && user.id) {
      userid.value = user.id;
      sessionStorage.setItem(AUTH_TOKEN, user.id);
    } else {
      userid.value = null;
      sessionStorage.removeItem(AUTH_TOKEN);
      router.go(0);
    }
  });
}

export function login(userid: string) {
  console.log('login');
  return authentication(userid);
}
export function logout() {
  console.log('logout');
  authentication(null);
}

if (sessionStorage.getItem(AUTH_TOKEN)) {
  authentication(sessionStorage.getItem(AUTH_TOKEN));
}

// // export toRefs(state);
