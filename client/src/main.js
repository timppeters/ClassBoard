import Vue from 'vue'
import App from './App.vue'
import router from './router'
import socketio from 'vue-socket.io'

Vue.config.productionTip = false;

Vue.use(new socketio({
  debug: true,
  connection: 'localhost:3000'
}));

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
