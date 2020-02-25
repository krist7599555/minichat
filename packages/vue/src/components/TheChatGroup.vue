<template lang="pug">
  #groups
    .field
      .button.is-primary(@click='openCreateDialog()') create group
    br
    template(v-for='room in rooms')
      .field: .control
        button.button(
          :key='room.id'
          @click='viewRoom(room)'
          :class='{"is-primary": room.id == roomid, "is-joined": room.joined}'
        )
          p {{room.title}} ({{room.joined ? "join" : "not join"}})
</template>

<script lang="ts">
// import { rooms$, roomid$ } from '../store/chat';
import { constant } from 'lodash';

export default {
  name: 'TheChatGroup',
  // subscriptions: constant({
  //   rooms: rooms$,
  //   roomid: roomid$
  // }),
  methods: {
    openCreateDialog() {
      this.$buefy.dialog.prompt({
        message: `Group Title`,
        inputAttrs: {
          placeholder: 'นครวัด หมากระจอก',
          maxlength: 30
        },
        trapFocus: true,
        onConfirm: title => {
          // api.createGroup(title).subscribe(() => this.$buefy.toast.open('success'))
        }
      });
    },
    viewRoom(room) {
      if (room.joined) {
        this.$router.push({ name: 'room', params: { id: room.id } });
      } else {
        this.$buefy.dialog.confirm({
          message: `คุณต้องการเข้าร่วมกลุ่ม ${room.title} ใช่ไหม`,
          trapFocus: true,
          onConfirm: async title => {
            this.$router.push({ name: 'room', params: { id: room.id } });
          }
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../style';
</style>
