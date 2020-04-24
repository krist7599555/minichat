<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { profile } from './store/auth';

export default Vue.extend({
  mounted() {
    profile();
  }
});
</script>

<style lang="scss"></style>
