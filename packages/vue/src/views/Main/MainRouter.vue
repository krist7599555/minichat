<template>
  <div style='display:flex; justify-content: center; align-items: center; height: 100%'>
    <component :is='comp'></component>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BehaviorSubject } from 'rxjs'
import ReadMeVue from './ReadMe.vue';
// import MessageVue from './Message.vue';
import { ref, onMounted } from '@vue/composition-api';

export const nav = new BehaviorSubject(ReadMeVue);

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