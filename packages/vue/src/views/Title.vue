<template lang='pug'>
  .app-title
    p(v-if='roomid') #[b {{active_room.title}}]

    p(v-else-if='is_auth')
    p(v-else)
    b-dropdown(v-show='roomid' :hoverable='false' position='is-bottom-left')
      fa(icon='bars' slot="trigger")
      b-dropdown-item(@click='invite_friend()' aria-role="listitem")
        a.ddown-item.has-text-primary #[fa.ddown-icon(icon="user-plus")] Invite Friend        
      b-dropdown-item(@click='rename_room()' aria-role="listitem")
        a.ddown-item.has-text-primary(disabled) #[fa.ddown-icon(icon="edit")] Rename         
      b-dropdown-item(@click='room_leave()' aria-role="listitem")
        a.ddown-item.has-text-primary #[fa.ddown-icon(icon="door-open")] Leave
</template>

<script>
import { roomid, room_leave, active_room } from '../store/chat';
import { userid, is_auth, user } from '../store/auth';
import { rename_room } from '../store/dialog'
import { nav } from './Main/MainRouter.vue';
import InviteFriendVue from './Main/InviteFriend.vue';

export default {
  setup() {
    return {
      roomid, room_leave,
      userid, is_auth,
      user,
      invite_friend() {
        nav.next(InviteFriendVue);
      }, rename_room, active_room
    }
  }
}
</script>

<style lang='scss'>
$room-padding: 1.2rem;
.app-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: $room-padding;
}
</style>