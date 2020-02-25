import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);

import { ref, computed } from '@vue/composition-api';

import * as socket from './socket';
import * as _ from 'lodash';

const AUTH_TOKEN = 'token';

export const userid = ref<string>(null);
export const isAuth = computed(() => !!userid.value);

export async function login(uid: string) {
  if (/^[0-9a-zA-Z]+$/.test(uid)) {
    await socket.get('user:login', { userid: uid });
    userid.value = uid;
    if (!sessionStorage.getItem(AUTH_TOKEN);) {
      Toast.open({
        type: 'is-success',
        message: `leave group`
      });
    }
    sessionStorage.setItem(AUTH_TOKEN, uid);
  } else {
    throw new Error('userid must be number or alphabet only');
  }
}
export async function logout() {
  await socket.get('user:login', null);
  userid.value = null;
  sessionStorage.removeItem(AUTH_TOKEN);
}

export async function auto_auth_socket() {
  await socket.connected();
  return login(sessionStorage.getItem(AUTH_TOKEN)).catch(_.noop);
}

auto_auth_socket();
