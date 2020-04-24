/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { r } from 'rethinkdb-ts';
import { Room } from './interface';
import * as _ from 'lodash';
import { users, rooms, messages } from './rethinkdb';
import { BadRequestException } from '@nestjs/common';




export async function get_rooms(userid: string) {
  console.log(await users.get(userid)('rooms').coerceTo('array').run())
  return users.get(userid)('rooms').coerceTo('array').map(function(o) {
    const roomid = o(0)
    const latest = o(1)('latest')
    const msgs = messages.filter({ roomid: roomid as any })
    return rooms.get(roomid).merge({
      // @ts-ignore
      latest_message: msgs.max('time')('text').default(null),
      // @ts-ignore
      time:           msgs.max('time')('time').default(r.now()),
      unreads:        msgs.filter(function(m) {
        return r.and(
          m('time').gt(latest),
          m('roomid').eq(roomid)
        )
      }).count(),
    })
  }).run()
}


export async function set_room_title(roomid, title) {
  return rooms.get(this.roomid)
    .update({ title })
    .run();
}



export async function is_join_room(userid: string, roomid: string) {
  if (!userid) throw new Error("userid is require");
  console.log("[roomid] is_join_room", [roomid])
  if (!roomid) throw new Error("roomid is require");
  // @ts-ignore
  return users.get(userid)('rooms')(roomid).default(null).coerceTo("bool").run()
}


export async function do_join_room(userid: string, roomid: string) {
  if (!userid) throw new Error("userid is require");
  console.log("[roomid] do_join_room", [roomid])
  if (!roomid) throw new Error("roomid is require");
  if (await is_join_room(userid, roomid)) throw new Error('already joined');
  await users.get(userid)
    .update({
      rooms: { 
        [roomid]: { latest: r.epochTime(0) } 
      },
    })
    .run();
}
export async function do_left_room(userid: string, roomid: string) {
  if (!userid) throw new Error("userid is require");
  console.log("[roomid] do_left_room", [roomid])
  if (!roomid) throw new Error("roomid is require");
  await users.get(userid)
    .update({ rooms: { [roomid]: r.literal() } } as any)
    .run();
}

export async function mark_as_read(userid: string, roomid: string) {
  if (!userid) throw new Error("userid is require");
  console.log("[roomid] mark_as_read", [roomid])
  if (!roomid) throw new Error("roomid is require");
  await users.get(userid)
    .update({ rooms: { [roomid]: { latest: r.now() } } })
    .run();
}

export async function get_room_messages(userid: string, roomid: string) {
  await mark_as_read(userid, roomid); // update reading time
  return messages
    .filter(msg => msg('roomid').eq(roomid))
    .map(msg => msg.merge({
      user: users.get(msg('userid')).pluck('id', 'display_name')
    }))
    .orderBy(r.asc('time'))
    .run();
}
  


export async function create_room(title: string): Promise<Room> {
  if (!title) throw new BadRequestException("require title to create room");
  return await rooms.insert(
    { title: title, create_time: r.now() },
    { returnChanges: true },
  )
    .run()
    .then(wr => {
      return wr.changes[0].new_val;
    });
}

export async function create_message(userid: string, roomid: string, text: string) {
  if (! await is_join_room(userid, roomid)) throw new Error("can not create messsage in this room")
  await messages.insert({
    userid: userid,
    roomid: roomid,
    time: r.now(),
    text,
  }).run();
}



// * //////////////////////////////////////////////////////////////////////
// * WATCHING


async function watch_(collection, cb = null) {
  const cursor = await {users, rooms, messages}[collection].changes().run();
  if (_.isFunction(cb)) {
    cursor.each((...rest) => cb(...rest));
  } else {
    return cursor;
  }
}

export async function watch_users   (cb = null) { return watch_("users",    cb); }
export async function watch_rooms   (cb = null) { return watch_("rooms",    cb); }
export async function watch_messages(cb = null) { return watch_("messages", cb); }