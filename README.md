### 基于Element-UI 上传图片生成高斯模糊图片返回

### Install
```
npm install blurred-pic -S
```

### Quick Start
```
import BlurredPic from 'blurred-pic'
Vue.use(BlurredPic)

// or
import {
  BlurredPic,
} from 'blurred-pic'

Vue.component(BlurredPic.name, BlurredPic)
```

### 参数
```
1.
/*
 * @usage: 是否显示预览高斯模糊图片
 * @param: show-blurred
 * @return:
 */
2.
/*
 * @usage: 接受上传完的图片路径数组（包括原图和高斯模糊图片）
 * @param: list
 * @return:
 */
3.
/*
 * @usage: 上传时附带的额外参数
 * @param: data
 * @return:
 */
3.
/*
 * @usage: 上传时请求API 
 * @param: uploadApi
 * @return:
 */

 
```  
### demo
```
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

```