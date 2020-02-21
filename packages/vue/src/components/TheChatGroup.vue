<template lang="pug">
  #groups
    .button.is-primary(@click='openDialog()') create group
    .group(
      v-for='g in rooms'
      @click='$router.push({name: "room", params: {id: g.id}})'
      :class='{"is-active": g.id == roomid}'
    ) 
      fa.icon(:icon='g.image')
      p {{g.title}} ({{g.member}} คน)
    b-modal()
      h pkkkkkkkkkk

            //- <modal-form v-bind="formProps"></modal-form>
        
</template>

<script lang="ts">
import { rooms$, roomid$ } from '../store/chat';
import { constant } from 'lodash';
import * as api from '../store/api';

export default {
  name: 'TheChatGroup',
  subscriptions: constant({
    rooms: rooms$,
    roomid: roomid$
  }),
  methods: {
    openDialog() {
      this.$buefy.dialog.prompt({
        message: `Group Title`,
        inputAttrs: {
          placeholder: 'นครวัด หมากระจอก',
          maxlength: 30
        },
        trapFocus: true,
        onConfirm: title =>
          api.createGroup(title).subscribe(() => this.$buefy.toast.open('success'))
      });
    }
  }
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
