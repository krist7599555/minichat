import * as _ from 'lodash';
import { RDatum } from 'rethinkdb-ts';

export type Unreads = Record<string, Date>;
export interface User {
  id: string;
  unreads?: Unreads;
}
export interface Group {
  id: string;
  title: string;
}
export interface Message {
  userid: string;
  roomid: string;
  text: string;
  time: Date | RDatum<Date>;
}

function combine(...fs: Function[]) {
  return o => _.every(fs.map(f => f(o)));
}
function okstr() {
  return combine(_.isString, _.negate(_.isEmpty));
}

export const validate_user = _.conforms<User>({
  id: okstr(),
});
export const validate_group = _.conforms<Group>({
  id: okstr(),
  title: okstr(),
});
export const validate_message = _.conforms<Message>({
  userid: okstr(),
  roomid: okstr(),
  text: okstr(),
  time: _.constant(true),
  // time: _.isDate,
});
// export const validate_unread = _.conforms<Join>({
//   userid: okstr(),
//   roomid: okstr(),
//   latest: _.constant(true),
//   // latest: _.isDate,
// });
