import Vue from 'vue'
import App from './App.vue'
//axios
import axios from'axios'
//router
import router from './router'
// //Vuetify
import vuetify from '@/plugins/vuetify'
//Vuetify Money
import "./plugins/vuetify-money.js";



//BootstrapVue
// import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'

// import Vuelidate from 'vuelidate'
// import VueSweetalert2 from 'vue-sweetalert2'

// const options = {
//     confirmButtonColor: '#42d47c',
//     cancelButtonColor: '#db2a3e'
// }

// Vue.use(VueSweetalert2, options)
// Vue.use(Vuelidate)

// ////// Install BootstrapVue
// Vue.use(BootstrapVue)
// ////// Optionally install the BootstrapVue icon components plugin
// Vue.use(IconsPlugin)

Vue.config.productionTip = false

Vue.prototype.$http = axios
Vue.prototype.$api = 'http://127.0.0.1:8000/api';
// Vue.prototype.$api = 'http://nugaskuy.site/paw/api';
// Vue.prototype.$proposal = 'http://nugaskuy.site/paw/submitProposal/';
// Vue.prototype.$picture = 'http://nugaskuy.site/paw/submitPicture/';
// Vue.prototype.$proposal = 'http://127.0.0.1:8000/submitProposal/';
// Vue.prototype.$picture = 'http://127.0.0.1:8000/submitPicture/';

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
