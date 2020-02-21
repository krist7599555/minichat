// import { r } from 'rethinkdb-ts';
// import { User, Message, Room } from './rethinkdb/rethinkdb.interface';
// const USERS = r.table<User>('users');
// const ROOMS = r.table<Room>('rooms');
// const MESSAGES = r.table<Message>('messages');

// // utils
// let assign = Object.assign;
// let clone = <T>(orig: T): T =>
//   Object.assign(Object.create(Object.getPrototypeOf(orig)), orig);

// // init
// function rethink(conn = {}) {
//   this.conn = clone(conn);
//   return this;
// }

// // setter
// rethink.prototype.user = function(userid) {
//   return assign(clone(this), { userid });
// };
// rethink.prototype.room = function(roomid) {
//   return assign(clone(this), { roomid });
// };

// // methods
// rethink.prototype.unreads = function() {
//   if (this.roomid) {
//     // USERS.get(this.userid)('rooms')
//     //   .coerceTo('array')
//     //   .filter(
//     //     r
//     //       .row(1)('subscribe')
//     //       .eq(true),
//     //   )
//     //   .map(unred => ({
//     //     roomid: unred(0),
//     //     latest: unred(1)('latest'),
//     //     messages: messages
//     //       .coerceTo('array')
//     //       .filter(msg =>
//     //         r.and(msg('roomid').eq(unred(0)), msg('time').gt(unred(1))),
//     //         ({roomid: un msg('roomid').eq(unred(0)), msg('time').gt(unred(1))),
//     //       ),
//     //   }))
//     //   .run(conn);
//   } else {
//     return Promise.resolve([]);
//   }
// };
// rethink.prototype.send = function(text) {
//   return Promise.resolve([]);
// };
// rethink.prototype.messages = function() {
//   return Promise.resolve([]);
// };

// void (function() {
//   const o = { a: 12 };
//   const c = new rethink(o);
//   const d = c.user('userid');
//   console.log(c);
//   console.log(d);
//   console.log(d.room('888'));
//   console.log(d);
//   console.log(c);
//   console.log(c);
//   console.log(c.user('userid').room('roomid'));
//   c.user('userid')
//     .room('roomid')
//     .unreads()
//     .then(ar => {
//       console.log('........', ar);
//     });
// })();
