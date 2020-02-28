<template lang="pug">
div(style='background-color: #f39fc9; display: flex; height: 100vh;')
  #app-main-grid
    #app-badge.has-text-white(@click='chat.change_room(null)')
      fa(icon='comments')
      b(style='margin-left: 8px') Minichat
    #app-chat-list
      #chat-rooms
        .chat-room(
            v-for='room in chat.rooms.value'
            v-if='room.joined'
            :key='room.id'
            :class='{"is-active": room.id == chat.roomid.value}'
            @click='chat.change_room(room.id)'
          )
            img.kimage(:src="'https://picsum.photos/100?q=' + room.id")
            div
              p {{room.title}}
              p.help.has-text-grey {{room.latest_message}}
            .tag.is-primary.is-rounded(style='margin-left: auto' v-show='room.unreads') {{room.unreads}}
    #app-chat-tool
      b-tooltip(label="add" type='is-white') 
        a.after-tooltip(:disabled='!auth.isAuth.value' @click='auth.isAuth.value && dialog.create_room()'): fa.has-text-white(icon='plus')
      b-tooltip(label="offline" type='is-white')
        a.after-tooltip(disabled): fa.has-text-white(icon='eye')
      b-tooltip(label="setting" type='is-white')
        a.after-tooltip(disabled): fa.has-text-white(icon='cog')
      b-tooltip(label="close" type='is-white')
        a.after-tooltip(:disabled='!auth.isAuth.value' @click='auth.isAuth.value && auth.logout()'): fa.has-text-white(icon='door-open')

    #app-room-title
      p(v-if='chat.currentRoom.value') #[b {{chat.currentRoom.value.title}}]
      p(v-else-if='auth.isAuth.value') #[b {{auth.userid.value}}]
      p(v-else)
      b-dropdown(v-show='chat.roomid.value' :hoverable='false' position='is-bottom-left')
        fa(icon='bars' slot="trigger")
        b-dropdown-item(@click='dialog.invite_friend()' aria-role="listitem")
          a.ddown-item.has-text-primary #[fa.ddown-icon(icon="user-plus")] Invite Friend        
        b-dropdown-item(@click='dialog.rename_room()' aria-role="listitem")
          a.ddown-item.has-text-primary(disabled) #[fa.ddown-icon(icon="edit")] Rename         
        b-dropdown-item(@click='chat.room_leave()' aria-role="listitem")
          a.ddown-item.has-text-primary #[fa.ddown-icon(icon="door-open")] Leave

    #app-room-chat
      #chat-messages(v-if='chat.roomid.value')
        .chat-message(
          v-for='message, i in chat.messages.value'
          :key='message.id' 
          :class='message.userid == auth.userid.value ? "me" : "you"'
        )
          .name(:class='i && message.userid == chat.messages.value[i-1].userid ? "is-hidden" : ""') {{message.userid}}
          .text {{message.text}}
      #app-info(v-else)
        .content
          b Minichat
          p.help typing without thinking
          b-button.is-outlined.is-small(type='is-primary' @click='dialog.login()' v-show='!auth.isAuth.value') sign in
          br
          br
          a.help(href='https://github.com/krist7599555/minichat' target='_blank') 
            b-icon(pack='fab' icon='github')

    #app-room-input
      input(
        @keyup.enter="chat.send_message($event.target.value);  $event.target.value = '';"
      )
</template>

<script>
import Vue from 'vue';
import { watch } from '@vue/composition-api';
import { auth, chat, dialog } from '../store';

watch([chat.messages], () => {
  Vue.nextTick(() => {
    const el = document.getElementById('chat-messages');
    if (el) {
      el.scrollIntoView({
        block: 'end',
        inline: 'nearest'
        // behavior: 'smooth'
      });
    }
  });
});

export default {
  name: 'Home',
  setup() {
    return {
      chat,
      auth,
      dialog
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
}

#app-main-grid {
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

  overflow: scroll;
}
#app-chat-tool {
  grid-area: chattool;
  background-color: $primary;
  display: flex;
  justify-content: space-evenly;
  padding: 0;
  align-items: center;
  > * {
    width: 100%;
    height: 100%;
  }
  .after-tooltip {
    cursor: pointer;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background-color: $primary;
    &:hover {
      background-color: darken($primary, 7);
    }
    &[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// * /////////////////////////////////
// * RIGHT SIDE

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
#app-room-chat {
  grid-area: roomchat;
  overflow: scroll;
  padding: 0 $room-padding;
  #app-info {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
}
#app-room-input {
  grid-area: roominput;
  input {
    font-size: $font-size;
    padding: 0.5rem $room-padding;
    outline: none;
    border: none;
    width: 100%;
    height: 100%;
  }
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

.kimage {
  width: 50px;
  height: 50px;
  border-radius: 100px;
  margin-right: 1rem;
}
</style>
