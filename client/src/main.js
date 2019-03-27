import Vue from 'vue'
import App from './App.vue'
import router from './router'
import socketio from 'vue-socket.io'
import VeeValidate from 'vee-validate'

Vue.config.productionTip = false;

let hostname = window.location.hostname;

Vue.use(new socketio({
  debug: true,
  connection: `${hostname}:3000`
}));

Vue.use(VeeValidate);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

console.log();
