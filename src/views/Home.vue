<template lang="pug">
div
  app-header
  .container
    .columns(style='margin-top: 3rem')
      .column.is-4
        app-chat-group(:id='id')
      .column
        p {{id}}
        app-chat-room(:id='id')
        

</template>

<script>
import { computed, watch } from '@vue/composition-api';

export default {
  name: 'Home',
  setup(props, ctx) {
    watch(
      () => ctx.root.$route.params,
      () => {
        console.log(ctx.root.$route.params);
      },
      {
        immediate: true
      }
    );
    // console.log("TCL: setup -> ctx.root.$route.params", ctx.root.$route.params)
    return {
      id: computed(() => ctx.root.$route.params.id)
    };
  }
};
</script>
