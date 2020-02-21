<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  mounted() {
    console.log('App.vue mounted');
  },
  watch: {
    $route: {
      deep: true,
      handler() {
        console.log('router change');
      }
    }
  }
});
</script>

<style lang="scss"></style>
