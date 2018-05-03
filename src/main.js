import Vue from 'vue'
import App from './App.vue'

import 'aframe';

Vue.config.ignoredElements = [
  'a-scene',
  'a-assets',
  'a-sky',
  'a-camera',
  'a-cursor',
  'a-animation',
  'a-entity'
]

new Vue({
  el: '#app',
  render: h => h(App)
})
