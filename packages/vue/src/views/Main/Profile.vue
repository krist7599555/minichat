<template lang="pug">
  .profile
    img(:src="'https://picsum.photos/100?q=' + user.id")
    br
    b Hello {{user.display_name}}
</template>

<script>
import { user } from '../../store/auth'

export default {
  setup() {
    return {
      user
    }
  }
}
</script>

<style lang='scss'>
.profile {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  img {
    width: 80px;
    overflow: hidden;
    border-radius: 1000px;
  }
}
</style>