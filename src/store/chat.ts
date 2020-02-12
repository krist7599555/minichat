import { BehaviorSubject } from 'rxjs';

interface Group {
  id: string;
  image: string;
  title: string;
  member: number;
}
export const group$ = new BehaviorSubject<Group[]>([
  { id: '694c258f2', image: 'coffee', title: 'Best Coffee Group', member: 13 },
  { id: '9a3b6c9bb', image: 'fish', title: 'Chula Eng CP44', member: 96 },
  { id: '33075ecff', image: 'home', title: '2110101 comprog', member: 333 },
  { id: '06c12ed2c', image: 'sun', title: 'HORA today', member: 2 }
]);

export function getchat(id: string) {
  throw new Error('not implement');
}
