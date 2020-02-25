<template lang="pug">
  nav.navbar.is-primary
    .container
      .k-navbar._left
        router-link.button.is-primary.is-inversed(:to='{ path: "/" }')
          b MiniChat 2110315
      .k-navbar._right
          .button.is-primary.is-inversed(href='#' @click='logout()') Logout
</template>

<script lang="ts">
// import { logout } from '../store/auth';

export default {
  name: 'TheHeader',
  data() {
    return {
      // logout
    };
  }
};
</script>

<style lang="scss">
.navbar > .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.k-navbar > .navbar-item {
  color: white;
}
</style>
