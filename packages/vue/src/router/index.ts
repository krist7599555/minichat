import Vue from 'vue';

import VueRouter from 'vue-router';

import { user$ } from '../store/auth';
import Home from '../views/Home.vue';
import Groups from '../views/Groups.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/chat', name: 'chat', component: Groups },
  { path: '/chat/:id', name: 'room', component: Home },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});
router.beforeEach((to, from, next) => {
  const auth = user$.value;
  if (auth && to.name == 'login') {
    next('/');
  } else if (!auth && to.name != 'login') {
    next('/login');
  } else {
    next();
  }
});
export default router;
