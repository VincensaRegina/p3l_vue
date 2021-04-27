import '@mdi/font/css/materialdesignicons.css' //npm install @mdi/font -D
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// import 'vuetify/dist/vuetify.css'
// Ensure you are using css-loader

Vue.use(Vuetify, {
  iconfont: 'mdi',
})

const opts = {}
export default new Vuetify(opts)
