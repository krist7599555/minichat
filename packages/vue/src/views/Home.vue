<template lang="pug">
div(style='background-color: #f39fc9; display: flex; height: 100vh;')
  #app-main-grid
    #app-badge.has-text-white(@click='nav_profile()')
      fa(icon='comments')
      b(style='margin-left: 8px') Minichat
    #app-chat-list
      RoomsVue
    #app-chat-tool
      TooltipVue
    #app-room-title
      TitleVue
    #app-room-chat
      MainRouterVue
    #app-room-input
      input(@keyup.enter="chat.send_message($event.target.value);  $event.target.value = '';")
</template>

<script>
import Vue from 'vue';
import { auth, chat, dialog } from '../store';
import MainRouterVue, { nav } from './Main/MainRouter.vue';
import { messages$, rooms, roomid } from '../store/chat';
import { is_auth, userid } from '../store/auth';
import RoomsVue from './Rooms.vue';
import TooltipVue from './Tooltip.vue';
import TitleVue from './Title.vue';
import InputVue from './Input.vue';
import ProfileVue from './Main/Profile.vue';


export default {
  name: 'Home',
  components: { MainRouterVue, RoomsVue, TooltipVue, TitleVue, InputVue },
  setup() {
    return {
      rooms,
      roomid,
      is_auth,
      userid,
      chat,
      auth,
      dialog,
      nav_profile() {
        nav.next(ProfileVue);
      }
    };
  }
};
</script>

<style lang="scss" scoped>
$room-padding: 1.2rem;
$primary: #df3f8f;
$font-size: 0.9rem;

// * /////////////////////////////////
// * MAIN GRID

#app-main-grid {
  height: 85vh;
  max-width: 650px;
  min-width: 650px;
  margin: auto;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 4fr 6fr;
  grid-template-rows: 3rem auto 4rem;
  grid-gap: 1.5px;
  grid-template-areas:
    'appbadge roomtitle'
    'chatlist roomchat'
    'chattool roominput';
  background-color: #e6e6e6;
  > * {
    background-color: white;
  }
}

// * /////////////////////////////////
// * LEFT SIDE

#app-badge {
  grid-area: appbadge;
  background-color: $primary;
  padding: 0.5rem $room-padding;
  display: flex;
  align-items: center;
  cursor: pointer;
}
#app-chat-list {
  grid-area: chatlist;
  overflow: scroll;
}
#app-chat-tool {
  grid-area: chattool;
}

// * /////////////////////////////////
// * RIGHT SIDE


#app-room-chat {
  grid-area: roomchat;
  overflow: scroll;
  padding: 0 $room-padding;
  #app-info {
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
}
#app-room-input {
  grid-area: roominput;
}

#chat-messages {
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;
  .chat-message {
    > .name {
      font-size: 0.7rem;
      &:not(.is-hidden) {
        margin-top: 10px;
      }
    }
    > .text {
      padding: 0.2rem 0.8rem 0.3rem;
      white-space: normal;
      word-break: break-all;
      height: unset;
      margin-bottom: 4px;
      font-size: $font-size;
    }
    $border-rad: 18px;
    &.me {
      align-self: flex-end;
      text-align: right;
      > .text {
        color: white;
        background-color: #df3f8f;
        border-radius: $border-rad 0px $border-rad $border-rad;
      }
    }
    &.you {
      align-self: flex-start;
      text-align: left;
      > .text {
        color: #444;
        background-color: #f4f4f4;
        border-radius: 0px $border-rad $border-rad $border-rad;
      }
    }
  }
}

</style>
