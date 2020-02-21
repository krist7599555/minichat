import { r } from 'rethinkdb-ts';
import Minichat from './minichat';
export const MINICHAT_CONNECTION = 'MINICHAT_CONNECTION';

export const MinichatConnectionProvider = {
  provide: MINICHAT_CONNECTION,
  useFactory: async (db: string) => {
    return new Minichat(await r.connect({ db }));
  },
};
