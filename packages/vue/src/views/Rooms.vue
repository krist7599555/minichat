<template>
  <div id='chat-rooms'>
    <div class='chat-room'
      v-for='room in rooms' 
      :key='room.id' 
      :class='{"is-active": room.id == roomid}' 
      @click='change_room(room.id)'
    >
        <img class='kimage' :src="'https://picsum.photos/100?q=' + room.id" />
        <div>
          <p> {{room.title}} </p>
          <p class='help has-text-grey'> {{room.latest_message}} </p>
        </div>
        <div class='tag is-primary is-rounded' style='margin-left: auto' v-show='room.unreads'> {{room.unreads}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { roomid, rooms, change_room } from '../store/chat';

export default Vue.extend({
  setup() {
    return {
      rooms, roomid, change_room
    }
  }  
})
</script>

<style lang="scss" scoped>
$room-padding: 1.2rem;
$primary: #df3f8f;
$font-size: 0.9rem;
#app-room-title {
  grid-area: roomtitle;
  padding: 0.5rem $room-padding;
  display: flex;
  align-items: center;
  justify-content: space-between;
  a {
    outline: none;
    border: none;
  }
  .ddown-item {
    display: flex;
    align-items: center;
    .ddown-icon {
      width: 20px;
      margin-right: 0.7rem;
    }
  }
}
.chat-room {
  width: 100%;
  border: none;
  padding: 0.5rem $room-padding;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: #f9f9f9;
  }
  &.is-active {
    background-color: #f0f0f0;
  }
}
.kimage {
  width: 50px;
  height: 50px;
  border-radius: 100px;
  margin-right: 1rem;
}
</style>