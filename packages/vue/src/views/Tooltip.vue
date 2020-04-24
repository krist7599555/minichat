<template lang='pug'>
.app-chat-tool 
  b-tooltip(label="add" type='is-white') 
    a.after-tooltip(:disabled='!is_auth' @click='is_auth && create_room()'): fa.has-text-white(icon='plus')
  b-tooltip(label="offline" type='is-white')
    a.after-tooltip(disabled): fa.has-text-white(icon='eye')
  b-tooltip(label="setting" type='is-white')
    a.after-tooltip(disabled): fa.has-text-white(icon='cog')
  b-tooltip(label="close" type='is-white')
    a.after-tooltip(:disabled='!is_auth' @click='is_auth && logout()'): fa.has-text-white(icon='door-open')
</template>

<script>
import { is_auth, logout } from '../store/auth'
import { create_room } from '../store/dialog'

export default {
  setup() {
    return {
      is_auth, logout, create_room
    }
  }
}
</script>

<style lang='scss'>
$room-padding: 1.2rem;
$primary: #df3f8f;
$font-size: 0.9rem;
.app-chat-tool {
  height: 100%;
  grid-area: chattool;
  background-color: $primary;
  display: flex;
  justify-content: space-evenly;
  padding: 0;
  align-items: center;
  > * {
    width: 100%;
    height: 100%;
  }
  .after-tooltip {
    cursor: pointer;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background-color: $primary;
    &:hover {
      background-color: darken($primary, 7);
    }
    &[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>