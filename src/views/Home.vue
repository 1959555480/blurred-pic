<template>
  <div class="home">
    <BlurredPic
      :list.sync="dataOj.items"
      :data="uploadParam"
      :show-blurred="true"
      @uploadApi="uploadApi"
    />
  </div>
</template>

<script>
// @ is an alias to /src
import BlurredPic from '@/components/Blurredpic.vue'

export default {
  name: 'Home',
  components: {
    BlurredPic
  },
  data() {
    return {
      dataOj: {
        items: []
      },
      uploadParam: {}
    }
  },
  methods: {
    uploadApi() {
      console.log('子组件调用父组件进行上传')
    }
  }
}
</script>
