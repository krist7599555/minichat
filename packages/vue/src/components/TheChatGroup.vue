<template lang="pug">
  #groups
    .group(
      v-for='g in rooms'
      @click='$router.push({name: "room", params: {id: g.id}})'
      :class='{"is-active": g.id == roomid}'
    ) 
      fa.icon(:icon='g.image')
      p {{g.title}} ({{g.member}} คน)
</template>

<script lang="ts">
import { rooms$, roomid$ } from '../store/chat';
import { constant } from 'lodash';

export default {
  name: 'TheChatGroup',
  subscriptions: constant({
    rooms: rooms$,
    roomid: roomid$
  })
};
</script>

<style lang="scss" scoped>
@import '../style';
.groups {
  margin-top: 1rem;
}
.group {
  cursor: pointer;
  display: flex;
  height: 3rem;
  align-items: center;
  border-left: solid 0.3rem transparent;
  &.is-active {
    border-left: solid 0.3rem lighten($primary, 20);
  }
  > .icon {
    width: 3rem;
    margin-right: 0.5rem;
  }
}
</style>
