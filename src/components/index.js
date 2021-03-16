import Vue from 'vue'
import BlurredPic from '@/components/Blurredpic.vue'

const Components = {
  BlurredPic
}

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name])
})

export default Components
