<template lang='html'>
  <div style='width: 100%'>
    <b>Invite Friend</b>
    <hr>
    <div class='user-card' v-for='user in users' :key='user.id' @click='invite(user)'>
      <img class='kimage' :src="'https://picsum.photos/100?q=' + user.id" />
      {{user.display_name}}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { onMounted, ref } from '@vue/composition-api';
import axios from 'axios';
import { active_room, roomid } from '../../store/chat';
export default Vue.extend({
  setup() {
    const users = ref([]);
    onMounted(async () => {
      users.value = await axios.get("/api/users").then(res => res.data)
      console.log(users.value)
      
    })
    
    return {
      users,
      invite(user) {
        this.$buefy.dialog.confirm({
            message: `Invite ${user.display_name} to ${active_room.value.title}`,
            type: 'is-success',
            confirmText: 'Invite',
            onConfirm: () => {
              axios.put(`/api/rooms/${roomid.value}/members/${user.id}`)
                .then(() => this.$buefy.toast.open({
                  message: 'invite success',
                  type: 'is-success'
                }))
                .catch((err) => this.$buefy.toast.open({
                  message: err.message,
                  type: 'is-danger'
                }))
            }
        })
      }
    }
  }
})
</script>

<style lang='scss'>
$room-padding: 1.2rem;
$primary: #df3f8f;
$font-size: 0.9rem;

.user-card {
  line-height: 3rem;
  // background-color: red;
  margin-left: -$room-padding;
  margin-right: -$room-padding;
  padding: 9px $room-padding;
  &:hover {
    background-color: #f4f4f4;
  }
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.kimage {
  width: 50px;
  height: 50px;
  border-radius: 100px;
  margin-right: 1rem;
}
</style>