import Vue from 'vue'
import Router from 'vue-router'
import Lobby from './views/Lobby.vue'
import Room from './views/Room.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'lobby',
      component: Lobby
    },
    {
      path: '/room',
      name: 'room',
      component: Room,
      props: true
    }
  ]
})
