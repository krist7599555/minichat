<template lang="pug">
  nav.navbar.is-primary
    .container
      .navbar-brand
        b-navbar-item(tag='router-link' :to='{ path: "/" }')
          b MiniChat 2110315
      .navbar-menu
        .navbar-end
          b-navbar-item(href='#' @click='logout()') Logout
</template>

<script>
import { logout } from '../store/index';

export default {
  name: 'Home',
  data() {
    return {
      logout
    };
  }
};
</script>
