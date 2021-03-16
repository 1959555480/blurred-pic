import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Element
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import BlurredPic from '@/components/Blurredpic.vue'
BlurredPic.install = Vue => Vue.component(BlurredPic.name, BlurredPic)
export default BlurredPic

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
