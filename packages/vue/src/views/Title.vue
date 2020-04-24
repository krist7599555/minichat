<template lang='pug'>
  .app-title
    p(v-if='roomid') #[b {{roomid.slice(0, 18)}}]

    p(v-else-if='is_auth') #[b {{userid}}]
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
import { roomid, room_leave } from '../store/chat'
import { userid, is_auth } from '../store/auth';
import { invite_friend, rename_room } from '../store/dialog'

export default {
  setup() {
    return {
      roomid, room_leave,
      userid, is_auth,
      invite_friend, rename_room, 
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