<template lang='pug'>
#chat-messages
  .chat-message(
    v-for='message, i in messages'
    :key='message.id' 
    :class='message.userid == userid ? "me" : "you"'
  )
    .name(:class='i && message.userid == messages[i-1].userid ? "is-hidden" : ""') {{message.user.display_name}}
    .text {{message.text}}
</template>

<script>
import { messages, messages$ } from '../../store/chat'
import { userid } from '../../store/auth'
import Vue from 'vue';

messages$.subscribe(() => {
  Vue.nextTick(() => {
    console.log('move')
    const el = document.getElementById('chat-messages');
    if (el) {
      el.scrollIntoView({
        block: 'end',
        inline: 'nearest'
        // behavior: 'smooth'
      });
    }
  });
})



export default {
  setup() {
    return {
      messages, userid
    }
  }
}
</script>

<style lang="scss" scoped>
$room-padding: 1.2rem;
$primary: #df3f8f;
$font-size: 0.9rem;

#chat-messages {
  width: 100%;
  // padding-left: 0.9rem;
  // padding-right: 0.9rem;
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
