<template lang='pug'>
div
  p chat {{messages}}
  .chat-message(
    v-for='message, i in messages'
    :key='message.id' 
    :class='message.userid == auth.userid.value ? "me" : "you"'
  )
    .name(:class='i && message.userid == chat.messages.value[i-1].userid ? "is-hidden" : ""') {{message.userid}}
    .text {{message.text}}
</template>

<script>
import * as chat from '../../store/chat'
export default {
  setup() {
    return {
      messages: chat.messages.value
    }
  }
}
</script>

<style>

</style>