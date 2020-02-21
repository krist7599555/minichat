import { ajax } from 'rxjs/ajax';

export function createGroup(title: string) {
  return ajax.post('/api/groups', { title });
}
