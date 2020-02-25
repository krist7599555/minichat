import Vue from 'vue';

import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// import VueRx from 'vue-rx';
// Vue.use(VueRx);

import Buefy from 'buefy';

import App from './App.vue';
// import './registerServiceWorker';
import router from './router';
import './store/auth';
import './style.scss';

// import ChatGroup from './components/TheChatGroup.vue';
// import ChatRoom from './components/TheChatRoom.vue';
import Header from './components/TheHeader.vue';

library.add(fas);

Vue.component('fa', FontAwesomeIcon);
Vue.component('app-header', Header);
Vue.use(Buefy, {
  defaultIconComponent: 'fa',
  defaultIconPack: 'fas'
});
// Vue.component('app-chat-group', ChatGroup);
// Vue.component('app-chat-room', ChatRoom);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
