<template lang="pug">
  div profile {{user}}
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

<style>

</style>