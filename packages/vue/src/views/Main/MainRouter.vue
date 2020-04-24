<template>
  <div style='display:flex; justify-content: center; align-items: center; min-height: 100%'>
    <component :is='comp'></component>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BehaviorSubject } from 'rxjs'
import ReadMeVue from './ReadMe.vue';
// import MessageVue from './Message.vue';
import { ref, onMounted } from '@vue/composition-api';
import { user$ } from '../../store/auth';
import ProfileVue from './Profile.vue';
import { roomid$ } from '../../store/chat';
import MessageVue from './Message.vue';

export const nav = new BehaviorSubject<unknown>(ReadMeVue);
user$.subscribe(u => {
  if (u) {
    nav.next(ProfileVue);
  } else {
    nav.next(ReadMeVue)
  }
})
roomid$.subscribe((roomid) => {
  if (roomid)
    nav.next(MessageVue)
})
export default Vue.extend({
  setup() {
    const comp = ref(nav.value);
    onMounted(() => {
      nav.subscribe(c => {
        comp.value = c
      })
    })
    return {
      comp
    }
  }
})
</script>