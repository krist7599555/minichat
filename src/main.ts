import './registerServiceWorker';
import './style.scss';

import Vue from 'vue';

import Buefy from 'buefy';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueCompositionApi from '@vue/composition-api';

import App from './App.vue';
import ChatGroup from './components/TheChatGroup.vue';
import ChatRoom from './components/TheChatRoom.vue';
import Header from './components/TheHeader.vue';
import router from './router';

Vue.use(Buefy);

library.add(fas);

Vue.component('fa', FontAwesomeIcon);
Vue.component('app-header', Header);
Vue.component('app-chat-group', ChatGroup);
Vue.component('app-chat-room', ChatRoom);

Vue.use(VueCompositionApi);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
