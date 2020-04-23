<template lang='pug'>
  .content
    b Minichat
    p.help typing without thinking
    b-button.is-outlined.is-small(
      type='is-primary' @click='login' 
    ) sign in
    br
    br
    a.help(href='https://github.com/krist7599555/minichat' target='_blank') 
      b-icon(pack='fab' icon='github')
</template>

<script>
import LoginVue from './Login.vue'
import { nav } from './MainRouter.vue'

export default {
  setup() {
    return {
      login() {
        nav.next(LoginVue)
      }
    }
  }
}
</script>

<style>

</style>s