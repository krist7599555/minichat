import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);
import { ToastProgrammatic as Toast } from 'buefy';
import { computed, reactive } from '@vue/composition-api';

import * as socket from './socket';
import * as _ from 'lodash';
import axios from 'axios'
import { BehaviorSubject, from } from 'rxjs';
import { pluck, flatMap, filter, mapTo, tap } from 'rxjs/operators';

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
})


export function profile() {
  return from(axios.get<User>("/api/profile")).pipe(
    pluck('data'),
    tap(() => socket.connect()),
    tap(usr => user$.next(usr))
  ).toPromise();
  
}

export async function login({ username, password }): Promise<User> {
  const res = await axios.post("/api/login", { username, password });
  Toast.open({
    type: 'is-success',
    message: res.status == 201 ? `register success` : 'login success'
  });
  return await profile();
    
}

export async function logout() {
  await axios.post("/api/logout");
  user$.next(null)
  Toast.open({
    type: 'is-success',
    message: `logout`
  });
}

