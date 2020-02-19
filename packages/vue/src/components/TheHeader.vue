<template lang="pug">
  nav.navbar.is-primary
    .container
      .navbar-brand
        b-navbar-item(tag='router-link' :to='{ path: "/" }')
          b MiniChat 2110315
      .navbar-menu.is-active
        .navbar-end
          b-navbar-item(href='#' @click='logout()') Logout
</template>

<script lang="ts">
import { logout } from '../store/auth';

export default {
  name: 'TheHeader',
  data() {
    return {
      logout
    };
  }
};
</script>
