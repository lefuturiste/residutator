import Vue from 'vue'
import VueRouter from 'vue-router'
import Graphic from '../views/Graphic.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Graphic',
    component: Graphic
  },
  {
    path: '/about',
    name: 'About',
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
