import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);
import { ToastProgrammatic as Toast } from 'buefy';
import { computed, reactive } from '@vue/composition-api';

import * as socket from './socket';
import * as _ from 'lodash';
import axios from 'axios'
import { BehaviorSubject } from 'rxjs'

interface User {
  id: string;
  username: string;
  display_name: string;
}

export const user = reactive({
  id: null,
  username: null,
  display_name: null
})
export const userid = computed(() => user.id)
export const is_auth = computed(() => !!userid.value);

export const user$ = new BehaviorSubject(null);
user$.subscribe(u => {
  if (u) {
    _.assign(user, u);
  } else {
    _.assign(user, _.mapValues(user, _.constant(null)));
  }
  console.log(user)
})


export async function login({ username, password }): Promise<User> {
  return axios.post<User>("/api/login", { username, password })
    .then(res => {
      socket.connect()
      res.status
      Toast.open({
        type: 'is-success',
        message: res.status == 201 ? `register success` : 'login success'
      });
      return this.profile()
    })
}

export async function profile(): Promise<User> {
  return axios.get("/api/profile")
  .then(res => res.data)
  .then(usr => {
    user$.next(usr)
    return usr
  })
}

export async function logout() {
  await axios.post("/api/logout")
  socket.disconnect()
  user$.next(null)
  Toast.open({
    type: 'is-success',
    message: `logout`
  });
}

