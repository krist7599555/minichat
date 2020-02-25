<template lang="pug">
  div
    .hero.is-fullheight
      .hero-body
        .container
          .has-text-centered
            b MiniChat
          br
          b-field(position='is-centered')
            b-input(placeholder="username" v-model='username')
            .control
              button.button.is-primary(@click='login(username)') Login

</template>

<script lang="ts">
// import { login } from '../store/auth';

export default {
  name: 'Login',
  data() {
    return {
      username: ''
      // login
    };
  }
};
</script>
