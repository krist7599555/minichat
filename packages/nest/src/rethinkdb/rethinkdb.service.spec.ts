import { Test, TestingModule } from '@nestjs/testing';
import { RethinkdbService } from './rethinkdb.service';
import { RethinkdbModule } from './rethinkdb.module';
import * as _ from 'lodash';

const TEST_DB_NAME = 'testminichat';

describe('RethinkdbService', () => {
  let rethink: RethinkdbService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RethinkdbService],
      imports: [RethinkdbModule.forRoot({ db: TEST_DB_NAME })],
    }).compile();
    rethink = await module.resolve(RethinkdbService);
    await rethink.reset_database();
  });
  // beforeEach(() => rethink.reset_database());
  afterAll(async () => {
    // await rethink.drop_database();
    await rethink.close_connection();
  });

  // prettier-ignore
  describe('normal flow', () => {
    const USER1: string = 'user-1';
    const USER2: string = 'user-2';
    const ROOM1: string = 'room-1';
    let   ROOM2: string = '';
    
    it('init rooms', async () => {
      await expect(rethink.get_rooms()).resolves.toHaveLength(0);
    });
    it('create user', async () => {
      const u1 = rethink.user(USER1);
      const u2 = rethink.user(USER2);
      expect(await u1.create_user()).toBeTruthy();
      expect(await u1.get_user()).toHaveProperty('id', USER1);
      await expect(u1.create_user()).toReject();
      expect(await rethink.get_users()).toHaveLength(1);
      expect(await u2.create_user()).toBeTruthy();
      await expect(u1.create_user()).toReject();
      await expect(u2.create_user()).toReject();
      expect(await rethink.get_users()).toIncludeSameMembers([
        expect.objectContaining({ id: USER1 }),
        expect.objectContaining({ id: USER2 }),
      ])
    });
    it('create room without id', async () => {
      let room2 = await rethink.create_room();
      ROOM2 = room2.id;
      await expect(room2).toContainAllKeys(['id', 'title'])
      expect(await rethink.get_rooms()).toHaveLength(1);
      expect(await rethink.room(ROOM1).create_room()).toHaveProperty('id', ROOM1);
      expect(await rethink.get_rooms()).toHaveLength(2);
      await expect(rethink.room(ROOM1).create_room()).toReject();
      expect(await rethink.get_rooms()).toIncludeSameMembers([
        expect.objectContaining({ id: ROOM1 }),
        expect.objectContaining({ id: ROOM2 }),
      ])
    });
    it('get rooms auth', async () => {
      await expect(rethink.get_users()).resolves.toHaveLength(2);
      await expect(rethink.get_rooms()).resolves.toHaveLength(2);
      await expect(rethink.user(USER1).get_rooms_auth()).resolves.toIncludeSameMembers([
        expect.objectContaining({ id: ROOM1, joined: false }),
        expect.objectContaining({ id: ROOM2, joined: false }),
      ]);
    })
    it('test left/join group', async () => {
      const o = rethink.user(USER1).room(ROOM1);
      expect(await o.is_join_room()).toBeFalse();
      await expect(o.do_left_room()).toReject();
      expect(await o.do_join_room()).toHaveProperty('replaced', 1)
      expect(await o.is_join_room()).toBeTrue();
      await expect(o.do_join_room()).toReject();
      expect(await o.do_left_room()).toHaveProperty('replaced', 1)
      expect(await o.is_join_room()).toBeFalse();
    })
    it('message group', async () => {
      const o = rethink.user(USER1).room(ROOM1);
      await o.do_join_room();
      expect(await o.get_rooms_auth()).toIncludeSameMembers([
        expect.objectContaining({ id: ROOM1, joined: true, unreads: 0 }),
        expect.objectContaining({ id: ROOM2, joined: false }),
      ]);
      expect(await o.create_message('hello1')).toHaveProperty('inserted', 1);
      expect(await o.create_message('hello2')).toHaveProperty('inserted', 1);
      expect(await o.get_rooms_auth()).toIncludeSameMembers([
        expect.objectContaining({ id: ROOM1, joined: true, unreads: 2 }),
        expect.objectContaining({ id: ROOM2, joined: false }),
      ]);
      await o.do_left_room();
      expect(await o.get_rooms_auth()).toIncludeSameMembers([
        expect.objectContaining({ id: ROOM1, joined: false }),
        expect.objectContaining({ id: ROOM2, joined: false }),
      ]);
    })
  });

  // scribe('users', () => {
  // it('get all', async () => {
  //   const arr = await rethink.get();
  //   expect(_.isArray(arr)).toBe(true);
  //   expect(arr.length).toEqual(DUMP_USERS.length);
  // });
  // it('create new', async () => {
  //   expect(await rethink.createUser(USER_Z)).toHaveProperty('inserted', 1);
  //   expect(await rethink.getUser(USER_Z)).toBeTruthy();
  // });
  // it('create exist', async () => {
  //   expect(await rethink.createUser(USER_1)).toHaveProperty('errors', 1);
  // });
  // it('create duplicate', async () => {
  //   expect(await rethink.createUser(USER_Z)).toHaveProperty('inserted', 1);
  //   expect(await rethink.createUser(USER_Z)).toHaveProperty('errors', 1);
  // });
  // });
  // describe('groups', () => {
  // it('groups not empty', async () => {
  //   const grs = await rethink.getGroups();
  //   expect(_.isArray(grs)).toBe(true);
  //   expect(grs.length).toEqual(DUMP_GROUPS.length);
  // });
  // });
  // describe('join group', () => {
  // it('sending to unjoined group', async () => {
  //   await expect(
  //     rethink.sendMessage(USER_1, GROUP_1, 'random_text'),
  //   ).rejects.toThrow();
  // });
  // it('sending to joined group', async () => {
  //   expect(await rethink.isJoined(USER_1, GROUP_1)).toBeFalsy();
  //   expect(await rethink.getUserUnreads(USER_1)).toEqual({});
  //   expect(await rethink.joinGroup(USER_1, GROUP_1)).toHaveProperty(
  //     'replaced',
  //     1,
  //   );
  //   expect(await rethink.isJoined(USER_1, GROUP_1)).toBeTruthy();
  //   expect(await rethink.getUserUnreads(USER_1)).toHaveProperty(GROUP_1);
  //   expect(
  //     await rethink.sendMessage(USER_1, GROUP_1, 'random_text'),
  //   ).toHaveProperty('inserted', 1);
  // });
  // });
  // describe('unreads', () => {
  // it('user unreads messages 2 user 1 group', async () => {
  //   expect(await rethink.isJoined(USER_1, GROUP_1)).toBeFalsy();
  //   expect(await rethink.isJoined(USER_2, GROUP_1)).toBeFalsy();
  //   await rethink.joinGroup(USER_1, GROUP_1);
  //   await rethink.joinGroup(USER_2, GROUP_1);
  //   await rethink.sendMessage(USER_1, GROUP_1, 'user-1 to room-1');
  //   await rethink.sendMessage(USER_2, GROUP_1, 'user-2 to room-1');
  //   const ured1 = await rethink.getUserUnreadsMessage(USER_1);
  //   const ured2 = await rethink.getUserUnreadsMessage(USER_2);
  //   expect(ured1).toHaveLength(1);
  //   expect(ured2).toHaveLength(1);
  //   expect(ured1).toEqual(ured2);

  //   const uredg1 = _.find(ured1, { roomid: GROUP_1 });
  //   expect(uredg1.messages).toHaveLength(2);
  //   expect(uredg1).toMatchObject({
  //     roomid: expect.any(String),
  //     latest: expect.any(Date),
  //     messages: expect.arrayContaining([
  //       expect.objectContaining({
  //         userid: USER_1,
  //         roomid: GROUP_1,
  //         text: 'user-1 to room-1',
  //       }),
  //       expect.objectContaining({
  //         userid: USER_2,
  //         roomid: GROUP_1,
  //         text: 'user-2 to room-1',
  //       }),
  //     ]),
  //   });
  // });

  // it('user unreads messages 1 user 2 group', async () => {
  //   expect(await rethink.isJoined(USER_1, GROUP_1)).toBeFalsy();
  //   expect(await rethink.isJoined(USER_1, GROUP_2)).toBeFalsy();
  //   await rethink.joinGroup(USER_1, GROUP_1);
  //   await rethink.joinGroup(USER_1, GROUP_2);
  //   await rethink.sendMessage(USER_1, GROUP_1, 'user-1 to room-1');
  //   await rethink.sendMessage(USER_1, GROUP_2, 'user-1 to room-2 1');
  //   await rethink.sendMessage(USER_1, GROUP_2, 'user-1 to room-2 2');
  //   const ured = await rethink.getUserUnreadsMessage(USER_1);
  //   expect(ured).toHaveLength(2);
  //   expect(_.find(ured, { roomid: GROUP_1 }).messages).toHaveLength(1);
  //   expect(_.find(ured, { roomid: GROUP_2 }).messages).toHaveLength(2);
  //   expect(ured).toEqual(
  //     expect.arrayContaining([
  //       {
  //         roomid: GROUP_1,
  //         latest: expect.any(Date),
  //         messages: expect.any(Array),
  //       },
  //       {
  //         roomid: GROUP_2,
  //         latest: expect.any(Date),
  //         messages: expect.any(Array),
  //       },
  //     ]),
  //   );
  // });
  // it('reading message in group', async () => {
  //   expect(await rethink.isJoined(USER_1, GROUP_1)).toBeFalsy();
  //   await rethink.joinGroup(USER_1, GROUP_1);
  //   const ins = expect.objectContaining({ inserted: 1 });
  //   expect(await rethink.sendMessage(USER_1, GROUP_1, '1')).toEqual(ins);
  //   expect(await rethink.sendMessage(USER_1, GROUP_1, '2')).toEqual(ins);
  //   expect(await rethink.sendMessage(USER_1, GROUP_1, '3')).toEqual(ins);
  //   const ured = await rethink.getUserUnreadsMessageGroup(USER_1, GROUP_1);
  //   expect(ured).toEqual(
  //     expect.objectContaining({
  //       roomid: GROUP_1,
  //       latest: expect.any(Date),
  //       messages: expect.any(Array),
  //     }),
  //   );
  //   expect(ured.messages).toHaveLength(3);
  //   expect(await rethink.read(USER_1, GROUP_1)).toHaveProperty('replaced', 1);
  //   const ured2 = await rethink.getUserUnreadsMessageGroup(USER_1, GROUP_1);
  //   expect(ured2.messages).toHaveLength(0);

  //   // new people is post
  //   await rethink.joinGroup(USER_2, GROUP_1);
  //   await rethink.sendMessage(USER_2, GROUP_1, '4');
  //   const ured3 = await rethink.getUserUnreadsMessageGroup(USER_1, GROUP_1);
  //   expect(ured3.messages).toHaveLength(1);
  //   const ured4 = await rethink.getUserUnreadsMessageGroup(USER_2, GROUP_1);
  //   expect(ured4.messages).toHaveLength(4);
  // });
  // it('get unread message on unjoined group', async () => {
  //   await expect(
  //     rethink.getUserUnreadsMessageGroup(USER_1, GROUP_1),
  //   ).rejects.toThrow();
  // });
  // it('get unread message on all group', async () => {
  //   await expect(rethink.getUserUnreadsMessage(USER_1)).resolves.toBeTruthy();
  // });
  // });
});

// afterAll(async done => {
//   // Closing the DB connection allows Jest to exit successfully.
//   // dbConnection.close();
//   done();
// });
