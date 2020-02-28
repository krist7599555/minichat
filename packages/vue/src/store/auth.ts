import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);
import { ToastProgrammatic as Toast } from 'buefy';
import { ref, computed, watch } from '@vue/composition-api';

import * as socket from './socket';
import * as _ from 'lodash';

const AUTH_TOKEN = 'token';

export const userid = ref<string>(null);
export const isAuth = computed(() => !!userid.value);

watch(
  () => userid.value,
  () => {
    console.log('TCL: userid.value', userid.value);
    console.log('TCL: isAuth', isAuth.value);
  }
);

export async function login(uid: string) {
  if (/^[0-9a-zA-Z]+$/.test(uid)) {
    console.log('valid');
    await socket.get('do auth:login', { userid: uid });
    console.log('finish');
    userid.value = uid;
    if (!sessionStorage.getItem(AUTH_TOKEN)) {
      Toast.open({
        type: 'is-success',
        message: `login success`
      });
    }
    sessionStorage.setItem(AUTH_TOKEN, uid);
  } else {
    throw new Error('userid must be number or alphabet only');
  }
}

export async function logout() {
  if (userid.value) {
    await socket.get('do auth:logout', null);
    userid.value = null;
    sessionStorage.removeItem(AUTH_TOKEN);
    Toast.open({
      type: 'is-success',
      message: `logout`
    });
  }
}

export async function auto_auth_socket() {
  await socket.connected();
  const tok = sessionStorage.getItem(AUTH_TOKEN);
  if (tok) {
    return login(sessionStorage.getItem(AUTH_TOKEN)).catch(_.noop);
  }
}

auto_auth_socket();
