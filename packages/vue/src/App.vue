<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { profile } from './store/auth';
import { connect } from "./store/socket"
export default Vue.extend({
  mounted() {
    profile()
      .then(connect)
      .finally(console.log)
  }
});
</script>

<style lang="scss"></style>
