import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import router from '../router';
import * as socket from './socket';
import * as IO from './socket.model';
import * as _ from 'lodash';

const AUTH_TOKEN = 'token';

export const userid$ = new BehaviorSubject<string | null>(sessionStorage.getItem(AUTH_TOKEN));

userid$.subscribe((userid: string | null) => {
  socket.emit(IO.AUTH, { userid }, () => {
    console.log('auth acknowledge');
  });
});

export function login(userid: string) {
  userid$.next(userid);
  sessionStorage.setItem(AUTH_TOKEN, userid);
  router.go(0);
}
export function logout() {
  userid$.next(null);
  sessionStorage.removeItem(AUTH_TOKEN);
  router.go(0);
}
