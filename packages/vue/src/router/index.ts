import Vue from 'vue';

import VueRouter from 'vue-router';

import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', name: 'home', component: Home },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});
router.beforeEach((to, from, next) => {
  // const auth = userid$.getValue();
  // if (auth && to.name == 'login') {
  // next('/');
  // } else if (!auth && to.name != 'login') {
  //   next('/login');
  // } else {
  next();
  // }
});
export default router;
