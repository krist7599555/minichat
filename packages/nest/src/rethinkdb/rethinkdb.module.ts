import {
  Module,
  DynamicModule,
  FactoryProvider,
  Provider,
} from '@nestjs/common';
import { RethinkdbService } from './rethinkdb.service';

import { r, RConnectionOptions, Connection } from 'rethinkdb-ts';
import { RETHINKDB_CONNECTION } from './rethinkdb.provider';
import { noop } from 'lodash';

@Module({
  providers: [RethinkdbService],
  exports: [RethinkdbService],
})
export class RethinkdbModule {
  public static forRoot(options: RConnectionOptions = {}): DynamicModule {
    const rethink_connection_provider: Provider<Promise<Connection>> = {
      provide: RETHINKDB_CONNECTION,
      useFactory: async () => {
        const conn = await r.connect(options);
        await ensure_exists_in_minichat(conn);
        return conn;
      },
    };
    return {
      module: RethinkdbModule,
      global: true,
      exports: [rethink_connection_provider],
      providers: [rethink_connection_provider],
    };
  }
}

// prettier-ignore
async function ensure_exists_in_minichat(conn) {
  const db = conn['db'];
  await r.dbCreate(db).run(conn).catch(noop);
  for (const t of ['users', 'rooms', 'messages']) {
    await r.tableCreate(t).run(conn).catch(noop);
  }
}
