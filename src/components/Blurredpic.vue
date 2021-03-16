<template>
  <div>
    <el-upload
      ref="upload"
      accept="image/jpeg, image/png"
      :action="uploadUrl"
      :headers="headers"
      list-type="picture-card"
      :file-list="fileList"
      :data="data"
      :on-success="handleAvatarSuccess"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :before-remove="handleRemove2"
      :http-request="UploadImage"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <img id="img" src="" :class="[showBlurred? 'show':'']">
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
let that
export default {
  name: 'BlurredPic',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    uploadUrl: {
      type: String,
      default: ''
    },
    headers: {
      type: Object,
      default: () => {}
    },
    showBlurred: {
      type: Boolean,
      default: true
    },
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      fileList: [], // 用于回显的数组
      fileArray: [], // 用于上传给后端的数组
      dialogImageUrl: '',
      dialogVisible: false
    }
  },
  mounted() {
    that = this
  },
  methods: {
    handleRemove(file, fileList) {
      console.log('一处')
      this.fileArray = [] // 初始化我装图片地址的容器，（我需要传给后端的）
      fileList.forEach(item => {
        this.fileArray.push({ url: item.trueUrl || item.response.data, type: 'img' })
      })
      this.$emit('update:list', this.fileArray)
    },
    handleRemove2(file, fileList) {
      console.log('删除钱')
      this.$refs.upload.clearFiles()
      this.fileArray = [] // 初始化我装图片地址的容器，（我需要传给后端的）
      fileList.forEach(item => {
        this.fileArray.push({ url: item.trueUrl || item.response.data, type: 'img' })
      })
      this.$emit('update:list', this.fileArray)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleAvatarSuccess(res, file) {
      // 上传成功通知回调出去
      this.fileArray.push({ url: res.data, type: 'img' })
      this.$emit('update:list', this.fileArray)
    },
    // 正常上传
    nomarlUpload(param) {
      return new Promise((resolve, reject) => {
        const formData = new FormData()
        formData.append('file', param.file)
        formData.append('prefix', 'album')
        resolve(this.uploadPicApi(formData))
        reject(err => {
          new Error(`${err}错误异常`)
        })
      })
    },
    // 点击上传
    async UploadImage(param) {
      const normalPic = await this.nomarlUpload(param)
      const newFile = await toBlurImage(param.file)
      const virualPic = await displayFile(newFile)
      console.log('正常图片地址', normalPic)
      console.log('模糊图片地址', virualPic)
      const obj = {
        lockUrl: null,
        url: null
      }
      obj.lockUrl = virualPic
      obj.url = normalPic
      this.fileArray.push(obj)
      this.$emit('update:list', this.fileArray)
      console.log('返回图片数组', this.fileArray)
      const prom = new Promise((resolve, reject) => {})
      prom.abort = () => {}
      return prom
    },
    // 上传API
    async uploadPicApi(file) {
      this.$emit('uploadApi', file)
    }
  }
}

function displayFile(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader()
    let base64
    reader.readAsDataURL(file)
    reader.onload = function(e) {
      base64 = e.target.result
      document.querySelector('#img').src = e.target.result
      const blob = base64ToBlob(base64)
      blob.name = file.name
      const formData = new FormData()
      console.log('file', file)
      console.log('blob', blob)
      formData.append('file', blob, blob.name)
      formData.append('prefix', 'album')
      resolve(that.uploadPicApi(formData))
      reject(err => {
        new Error(`${err}错误异常`)
      })
      console.log('base64 => file', formData)
    }
  })
}

function toBlurImage(file) {
  return new Promise((resolve, reject) => {
    // 压缩图片需要的一些元素和对象
    var reader = new FileReader(); var img = new Image()

    // 缩放图片需要的canvas
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')

    // base64地址图片加载完毕后
    img.onload = function() {
      // 图片原始尺寸
      var originWidth = this.width
      var originHeight = this.height
      // 最大尺寸限制
      var maxWidth = originWidth; var maxHeight = originHeight
      // 目标尺寸
      var targetWidth = originWidth; var targetHeight = originHeight
      // 图片尺寸超过400x400的限制
      if (originWidth > maxWidth || originHeight > maxHeight) {
        if (originWidth / originHeight > maxWidth / maxHeight) {
          // 更宽，按照宽度限定尺寸
          targetWidth = maxWidth
          targetHeight = Math.round(maxWidth * (originHeight / originWidth))
        } else {
          targetHeight = maxHeight
          targetWidth = Math.round(maxHeight * (originWidth / originHeight))
        }
      }

      // canvas对图片进行缩放
      canvas.width = targetWidth
      canvas.height = targetHeight
      // 清除画布
      context.clearRect(0, 0, targetWidth, targetHeight)
      // 图片压缩
      context.drawImage(img, 0, 0, targetWidth, targetHeight)

      // 从画布获取一半图像
      var data = context.getImageData(0, 0, img.width, img.height)
      // 将图像数据进行高斯模糊 data.data是一个数组，每四个值代表一个像素点的rgba的值，data.width data.height 分别代表图像数据的宽高
      var emptyData = gaussBlur(data)
      // 将模糊的图像数据再渲染到画布上面
      context.putImageData(emptyData, 0, 0)

      // canvas转为blob并上传
      canvas.toBlob(function(blob) {
        blob.lastModifiedDate = new Date()
        blob.name = file.name

        const newFile = blob
        resolve(newFile)
      }, file.type || 'image/png')
    }

    // 文件base64化，以便获知图片原始尺寸
    reader.onload = function(e) {
      img.src = e.target.result
    }

    // 选择的文件是图片
    if (file.type.indexOf('image') === 0) {
      reader.readAsDataURL(file)
    } else {
      console.log('please select a image')
    }
  })
}

function gaussBlur(imgData) {
  var pixes = imgData.data
  var width = imgData.width
  var height = imgData.height
  var gaussMatrix = []
  var gaussSum = 0
  var x; var y
  var r; var g; var b; var a
  var i; var j; var k; var len

  var radius = 20
  var sigma = 10

  a = 1 / (Math.sqrt(2 * Math.PI) * sigma)
  b = -1 / (2 * sigma * sigma)
  // 生成高斯矩阵
  for (i = 0, x = -radius; x <= radius; x++, i++) {
    g = a * Math.exp(b * x * x)
    gaussMatrix[i] = g
    gaussSum += g
  }

  // 归一化, 保证高斯矩阵的值在[0,1]之间
  for (i = 0, len = gaussMatrix.length; i < len; i++) {
    gaussMatrix[i] /= gaussSum
  }
  // x 方向一维高斯运算
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      r = g = b = a = 0
      gaussSum = 0
      for (j = -radius; j <= radius; j++) {
        k = x + j
        if (k >= 0 && k < width) { // 确保 k 没超出 x 的范围
          // r,g,b,a 四个一组
          i = (y * width + k) * 4
          r += pixes[i] * gaussMatrix[j + radius]
          g += pixes[i + 1] * gaussMatrix[j + radius]
          b += pixes[i + 2] * gaussMatrix[j + radius]
          // a += pixes[i + 3] * gaussMatrix[j];
          gaussSum += gaussMatrix[j + radius]
        }
      }
      i = (y * width + x) * 4
      // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
      // console.log(gaussSum)
      pixes[i] = r / gaussSum
      pixes[i + 1] = g / gaussSum
      pixes[i + 2] = b / gaussSum
      // pixes[i + 3] = a ;
    }
  }
  // y 方向一维高斯运算
  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {
      r = g = b = a = 0
      gaussSum = 0
      for (j = -radius; j <= radius; j++) {
        k = y + j
        if (k >= 0 && k < height) { // 确保 k 没超出 y 的范围
          i = (k * width + x) * 4
          r += pixes[i] * gaussMatrix[j + radius]
          g += pixes[i + 1] * gaussMatrix[j + radius]
          b += pixes[i + 2] * gaussMatrix[j + radius]
          // a += pixes[i + 3] * gaussMatrix[j];
          gaussSum += gaussMatrix[j + radius]
        }
      }
      i = (y * width + x) * 4
      pixes[i] = r / gaussSum
      pixes[i + 1] = g / gaussSum
      pixes[i + 2] = b / gaussSum
    }
  }
  return imgData
}

const base64ToBlob = function(base64Data) {
  const arr = base64Data.split(',')
  const fileType = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let l = bstr.length
  const u8Arr = new Uint8Array(l)

  while (l--) {
    u8Arr[l] = bstr.charCodeAt(l)
  }
  return new Blob([u8Arr], {
    type: fileType
  })
}

</script>
<style scoped>
.show{
  display: none;
}
</style>
