import { BehaviorSubject } from 'rxjs';

import router from '../router';

const AUTH_TOKEN = 'token';

export interface Auth {
  sub: string;
}

export const user$ = new BehaviorSubject<Auth | null>(null);

export function login(username: string) {
  const obj: Auth = { sub: username };
  user$.next(obj);
  sessionStorage.setItem(AUTH_TOKEN, JSON.stringify(obj));
  router.go(0);
}
export function logout() {
  user$.next(null);
  sessionStorage.removeItem(AUTH_TOKEN);
  router.go(0);
}

(function main() {
  const u = sessionStorage.getItem(AUTH_TOKEN);
  if (u) {
    user$.next(JSON.parse(u));
  }
})();
