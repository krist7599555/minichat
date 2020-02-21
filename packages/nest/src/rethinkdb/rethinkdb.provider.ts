import { r } from 'rethinkdb-ts';
export const RETHINK_DB_CONNECTION = 'RETHINK_DB_CONNECTION';

export const RethinkdbConnectionProvider = {
  provide: RETHINK_DB_CONNECTION,
  useFactory: async (db: string) => {
    return r.connect({ db });
  },
};
