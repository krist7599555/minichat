
<template lang='pug'>
  input(@keyup.enter="chat.send_message($event.target.value); $event.target.value = ''")
</template>

<script>
import { send_message } from '../store/chat'

export default {
  setup() {
    return { 
      send_message
    }
  }
}
</script>

<style lang='scss'>
$room-padding: 1.2rem;
$primary: #df3f8f;
$font-size: 0.9rem;
input {
  font-size: $font-size;
  padding: 0.5rem $room-padding;
  outline: none;
  border: none;
  width: 100%;
  height: 100%;
}
</style>
