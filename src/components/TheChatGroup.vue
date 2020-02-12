<template lang="pug">
  #groups
    .group(
      v-for='g in group$.value'
      @click='$router.push({name: "room", params: {id: g.id}})'
      :class='{"is-active": g.id == id}'
    ) 
      fa.icon(:icon='g.image')
      p {{g.title}} ({{g.member}} คน)
</template>

<script>
import { group$ } from '../store/index';

export default {
  name: 'Home',
  props: ['id'],
  data() {
    return {
      group$
    };
  }
};
</script>

<style lang="scss" scoped>
@import '../style';
.groups {
  margin-top: 1rem;
}
.group {
  cursor: pointer;
  display: flex;
  height: 3rem;
  align-items: center;
  border-left: solid 0.3rem transparent;
  &.is-active {
    border-left: solid 0.3rem lighten($primary, 20);
  }
  > .icon {
    width: 3rem;
    margin-right: 0.5rem;
  }
}
</style>
