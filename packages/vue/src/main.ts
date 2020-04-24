import Vue from 'vue';

import VueCompositionApi from '@vue/composition-api';
Vue.use(VueCompositionApi);

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// import VueRx from 'vue-rx';
// Vue.use(VueRx);

import Buefy from 'buefy';

import App from './App.vue';
// import './registerServiceWorker';
import router from './router';
import './store/auth';
import './style.scss';

library.add(fas, faGithub);

Vue.component('fa', FontAwesomeIcon);

Vue.use(Buefy, {
  defaultIconComponent: 'fa',
  defaultIconPack: 'fas'
});

Vue.config.productionTip = false;

import axios from 'axios';
import { ToastProgrammatic as Toast } from 'buefy'
axios.interceptors.response.use(res => res, err => {
  console.log(err.response)
  err.message = err.response.data?.message || err.message;
  Toast.open({
    type: "is-danger",
    message: err.message
  })
  throw err;
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
