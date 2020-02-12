<template lang="pug">
  #chat
    template(v-if='!id')
      p Empty
    template(v-else)
      p {{id}}
    
    

</template>

<script>
import { watch, computed } from '@vue/composition-api';
export default {
  props: ['id'],
  setup(props) {
    watch(
      () => props.id,
      () => {
        props.id;
      }
    );

    return {};
  }
};
</script>
