<template lang="pug">
  .content
    b.label Login
    b-field(label=''): b-input(v-model='username' size='is-small' placeholder='username' type='text')
    b-field(label=''): b-input(v-model='password' size='is-small' placeholder='password' type='password')
    b-field: b-button.is-primary.is-fullwidth(size='is-small' @click='login()') login
    .help.is-danger {{error}}
</template>

<script lang="ts">
import Vue from 'vue'
import { ref } from '@vue/composition-api';
import * as auth from '../../store/auth'
import * as _ from 'lodash'
import { nav } from './MainRouter.vue';
import MessageVue from './Message.vue';
export default Vue.extend({
  setup() {
    const username = ref('')
    const password = ref('')
    const error = ref("")
    return {
      username,
      password,
      error,
      login() {
        auth.login({
          username: username.value,
          password: password.value,
        })
          .then(() => {
            nav.next(MessageVue)
          })
          .catch(err => {
            error.value = _.get(err, 'response.data.message', err.message)
          })
      }
    }
  }
})
</script>