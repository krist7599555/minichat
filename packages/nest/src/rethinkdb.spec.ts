import * as _ from 'lodash';
import * as rethink from './rethinkdb';
import { DUMP_GROUPS, DUMP_USERS } from './rethinkdb.spec.constant';

const USER_1 = 'user-1';
const USER_2 = 'user-2';
const USER_Z = 'user-z';

const GROUP_1 = 'room-1';
const GROUP_2 = 'room-2';
const GROUP_Z = 'room-z';

describe('RethinkDB', () => {
  beforeEach(async () => {
    await rethink.ready;
    await rethink.reset('test');
    for (let u of DUMP_USERS) await rethink.createUser(u.id);
    for (let g of DUMP_GROUPS) await rethink.createGroup(g.title, g.id);
  });

  describe('users', () => {
    it('get all', async () => {
      const arr = await rethink.getUsers();
      expect(_.isArray(arr)).toBe(true);
      expect(arr.length).toEqual(DUMP_USERS.length);
    });
    it('create new', async () => {
      expect(await rethink.createUser(USER_Z)).toHaveProperty('inserted', 1);
      expect(await rethink.getUser(USER_Z)).toBeTruthy();
    });
    it('create exist', async () => {
      expect(await rethink.createUser(USER_1)).toHaveProperty('errors', 1);
    });
    it('create duplicate', async () => {
      expect(await rethink.createUser(USER_Z)).toHaveProperty('inserted', 1);
      expect(await rethink.createUser(USER_Z)).toHaveProperty('errors', 1);
    });
  });
  describe('groups', () => {
    it('groups not empty', async () => {
      const grs = await rethink.getGroups();
      expect(_.isArray(grs)).toBe(true);
      expect(grs.length).toEqual(DUMP_GROUPS.length);
    });
  });
  describe('join group', () => {
    it('sending to unjoined group', async () => {
      await expect(
        rethink.sendMessage(USER_1, GROUP_1, 'random_text'),
      ).rejects.toThrow();
    });
    it('sending to joined group', async () => {
      expect(await rethink.isJoined(USER_1, GROUP_1)).toBeFalsy();
      expect(await rethink.getUserUnreads(USER_1)).toEqual({});
      expect(await rethink.joinGroup(USER_1, GROUP_1)).toHaveProperty(
        'replaced',
        1,
      );
      expect(await rethink.isJoined(USER_1, GROUP_1)).toBeTruthy();
      expect(await rethink.getUserUnreads(USER_1)).toHaveProperty(GROUP_1);
      expect(
        await rethink.sendMessage(USER_1, GROUP_1, 'random_text'),
      ).toHaveProperty('inserted', 1);
    });
  });
  describe('unreads', () => {
    it('user unreads messages 2 user 1 group', async () => {
      expect(await rethink.isJoined(USER_1, GROUP_1)).toBeFalsy();
      expect(await rethink.isJoined(USER_2, GROUP_1)).toBeFalsy();
      await rethink.joinGroup(USER_1, GROUP_1);
      await rethink.joinGroup(USER_2, GROUP_1);
      await rethink.sendMessage(USER_1, GROUP_1, 'user-1 to room-1');
      await rethink.sendMessage(USER_2, GROUP_1, 'user-2 to room-1');
      const ured1 = await rethink.getUserUnreadsMessage(USER_1);
      const ured2 = await rethink.getUserUnreadsMessage(USER_2);
      expect(ured1).toHaveLength(1);
      expect(ured2).toHaveLength(1);
      expect(ured1).toEqual(ured2);

      const uredg1 = _.find(ured1, { roomid: GROUP_1 });
      expect(uredg1.messages).toHaveLength(2);
      expect(uredg1).toMatchObject({
        roomid: expect.any(String),
        latest: expect.any(Date),
        messages: expect.arrayContaining([
          expect.objectContaining({
            userid: USER_1,
            roomid: GROUP_1,
            text: 'user-1 to room-1',
          }),
          expect.objectContaining({
            userid: USER_2,
            roomid: GROUP_1,
            text: 'user-2 to room-1',
          }),
        ]),
      });
    });

    it('user unreads messages 1 user 2 group', async () => {
      expect(await rethink.isJoined(USER_1, GROUP_1)).toBeFalsy();
      expect(await rethink.isJoined(USER_1, GROUP_2)).toBeFalsy();
      await rethink.joinGroup(USER_1, GROUP_1);
      await rethink.joinGroup(USER_1, GROUP_2);
      await rethink.sendMessage(USER_1, GROUP_1, 'user-1 to room-1');
      await rethink.sendMessage(USER_1, GROUP_2, 'user-1 to room-2 1');
      await rethink.sendMessage(USER_1, GROUP_2, 'user-1 to room-2 2');
      const ured = await rethink.getUserUnreadsMessage(USER_1);
      expect(ured).toHaveLength(2);
      expect(_.find(ured, { roomid: GROUP_1 }).messages).toHaveLength(1);
      expect(_.find(ured, { roomid: GROUP_2 }).messages).toHaveLength(2);
      expect(ured).toEqual(
        expect.arrayContaining([
          {
            roomid: GROUP_1,
            latest: expect.any(Date),
            messages: expect.any(Array),
          },
          {
            roomid: GROUP_2,
            latest: expect.any(Date),
            messages: expect.any(Array),
          },
        ]),
      );
    });
    it('reading message in group', async () => {
      expect(await rethink.isJoined(USER_1, GROUP_1)).toBeFalsy();
      await rethink.joinGroup(USER_1, GROUP_1);
      const ins = expect.objectContaining({ inserted: 1 });
      expect(await rethink.sendMessage(USER_1, GROUP_1, '1')).toEqual(ins);
      expect(await rethink.sendMessage(USER_1, GROUP_1, '2')).toEqual(ins);
      expect(await rethink.sendMessage(USER_1, GROUP_1, '3')).toEqual(ins);
      const ured = await rethink.getUserUnreadsMessageGroup(USER_1, GROUP_1);
      expect(ured).toEqual(
        expect.objectContaining({
          roomid: GROUP_1,
          latest: expect.any(Date),
          messages: expect.any(Array),
        }),
      );
      expect(ured.messages).toHaveLength(3);
      expect(await rethink.read(USER_1, GROUP_1)).toHaveProperty('replaced', 1);
      const ured2 = await rethink.getUserUnreadsMessageGroup(USER_1, GROUP_1);
      expect(ured2.messages).toHaveLength(0);

      // new people is post
      await rethink.joinGroup(USER_2, GROUP_1);
      await rethink.sendMessage(USER_2, GROUP_1, '4');
      const ured3 = await rethink.getUserUnreadsMessageGroup(USER_1, GROUP_1);
      expect(ured3.messages).toHaveLength(1);
      const ured4 = await rethink.getUserUnreadsMessageGroup(USER_2, GROUP_1);
      expect(ured4.messages).toHaveLength(4);
    });
    it('get unread message on unjoined group', async () => {
      await expect(
        rethink.getUserUnreadsMessageGroup(USER_1, GROUP_1),
      ).rejects.toThrow();
    });
    it('get unread message on all group', async () => {
      await expect(rethink.getUserUnreadsMessage(USER_1)).resolves.toBeTruthy();
    });
  });
});
