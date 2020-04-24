
<template lang='pug'>
div(style='height: 100%')
  input(:disabled='!is_typable' @keyup.enter="send_message($event.target.value); $event.target.value = ''")
</template>

<script>
import { send_message } from '../store/chat'
import { nav } from './Main/MainRouter.vue';
import MessageVue from './Main/Message.vue';
import { ref } from '@vue/composition-api';
import { map } from 'rxjs/operators';

const is_typable = ref(false)
nav.pipe(
  map(nv => nv == MessageVue)
).subscribe(t => is_typable.value = t)

export default {
  setup() {
    return { 
      is_typable,
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
