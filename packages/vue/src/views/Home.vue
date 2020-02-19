<template lang="pug">
div
  app-header
  .container
    .columns(style='margin-top: 3rem; margin-bottom: 3rem')
      .column.is-4(style='border-right: 2px solid #eee')
        app-chat-group(:id='id')
      .column.is-7
        div(style='padding-left: 3rem; padding-right: 3rem')
          app-chat-room(:id='id')
</template>

<script>
import { computed, watch } from '@vue/composition-api';
import { noop } from 'lodash';
import { changeroom } from '../store/chat';

export default {
  name: 'Home',
  setup(props, ctx) {
    return {
      id: computed(() => ctx.root.$route.params.id)
    };
  },
  watch: {
    ['$route.params.id']() {
      changeroom(this.$route.params.id);
    }
  }
};
</script>
