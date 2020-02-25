<template lang="pug">
  #chat: #chat-wrapper
    template(v-if='!roomid')
      p Please Select Room
    template(v-else)
      #inner-chat
        b-field(v-for='m in messages' :key='m.id') 
          //- b-field
          .control(:style='{"text-align": m.userid == userid ? "right" : "left"}')
            p(style='font-size: 10px') {{m.userid}}
            .tag.is-medium(style='white-space: normal; word-break: break-all; height: unset') {{m.text}}
      br
      form(@submit.prevent='onSubmit')
        b-field(grouped)
          b-input(v-model='text' required expanded)
          .control
            b-button(type='is-primary' native-type='submit' :disabled='!roomid') submit
    
    

</template>

<script lang="ts">
import Vue from 'vue';
import { ref } from '@vue/composition-api';
// import { messages$, roomid$, send_message } from '../store/chat';
// import { userid$ } from '../store/auth';
import { constant } from 'lodash';

// messages$.subscribe(() => {
//   Vue.nextTick(() => {
//     const el = document.getElementById('inner-chat');
//     if (el) {
//       document.getElementById('inner-chat').scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
//     }
//   });
// });

export default {
  name: 'TheChatRoom',
  // subscriptions: constant({
  //   messages: messages$,
  //   roomid: roomid$,
  //   userid: userid$
  // }),
  setup() {
    const text = ref('');
    function onSubmit() {
      if (text.value) {
        // send_message(text.value);
        text.value = '';
      }
    }
    return {
      text,
      onSubmit
    };
  }
};
</script>

<style lang="scss" scoped>
#inner-chat {
  height: 70vh;
  overflow-y: scroll;
}
</style>
