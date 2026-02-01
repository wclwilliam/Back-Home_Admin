<script setup>
import { reactive, onMounted,computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'
import Swal from 'sweetalert2'
import { backHomeApi } from '@/utils/publicApi'

const router = useRouter()
const route = useRoute()
const fileUrl = import.meta.env.VITE_FILE_URL
const handleCancel = () => {
  Swal.fire({
    title: '確定要取消嗎？',
    text: '未儲存的內容將會遺失',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#E14720',
    cancelButtonColor: '#0E6273',
    confirmButtonText: '確定離開',
    cancelButtonText: '留在此頁',
  }).then((result) => {
    if (result.isConfirmed) {
      router.push({ name: 'report' })
    }
  })
}

const formData = reactive({
  id: '',
  year: '',
  imageName: '',
  imageUrl: '',
})

const yearValidator = computed(() => /^(19|20)\d{2}$/.test(formData.year.trim()))

// 儲存原始檔案（用於上傳）
let imageFile = null
let reportIdNumber = null // 儲存數字 ID（不含 #）

// 表單驗證
const validateForm = () => {
  if (!formData.year.trim() || !yearValidator.value) {
    Swal.fire({
      title: '錯誤',
      text: '請輸入正確年分',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return false
  }
  if (!formData.imageName) {
    Swal.fire({
      title: '錯誤',
      text: '請上傳徵信圖片',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return false
  }
  return true
}

// 格式化編號為 #1000X 格式
const formatReportId = (id) => {
  return id ? `#${String(10000 + Number(id))}` : ''
}

// 載入徵信資料
const loadReportData = async () => {
  const id = route.params.id
  if (!id) return

  try {
    const response = await backHomeApi.get(`./donation/report_get.php?id=${id}`)
    const data = response.data
    console.log(data);
    

    // 後端回傳的資料 map 到 formData
    reportIdNumber = data.FINANCIAL_REPORT_ID // 儲存數字 ID
    formData.id = formatReportId(data.FINANCIAL_REPORT_ID)
    formData.year = data.DATA_YEAR

    // 圖片預覽
    if (data.FILE_PATH) {
      formData.imageUrl = fileUrl + data.FILE_PATH
      formData.imageName = data.FILE_PATH.split('/').pop() // 取得檔名
    }
  } catch (error) {
    console.error('載入資料失敗:', error)
    Swal.fire({
      title: '錯誤',
      text: '找不到該徵信資料',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
  }
}

// 組件掛載後執行
onMounted(() => {
  loadReportData()
})

const handleImageChange = (uploadFile) => {
  formData.imageName = uploadFile.name
  formData.imageUrl = URL.createObjectURL(uploadFile.raw)
  imageFile = uploadFile.raw // 儲存原始檔案
}

// 圖片上傳前驗證
const beforeImageUpload = (rawFile) => {
  // 限制格式：JPG, JPEG, PNG, WebP
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const isValidType = allowedTypes.includes(rawFile.type)

  if (!isValidType) {
    Swal.fire({
      title: '格式錯誤',
      text: '只接受 JPG、PNG 或 WebP 格式的圖片！',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return false
  }

  // 限制檔案大小：10MB
  const isLt10M = rawFile.size / 1024 / 1024 < 10
  if (!isLt10M) {
    Swal.fire({
      title: '檔案過大',
      text: '圖片大小不能超過 10MB！',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  // 確保圖片已上傳
  if (!formData.imageUrl && !imageFile) {
    Swal.fire({
      title: '錯誤',
      text: '請上傳徵信圖片',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return
  }

  const submitData = new FormData()
  submitData.append('id', reportIdNumber)
  submitData.append('year', formData.year)

  // 只有更換圖片時才附加
  if (imageFile) {
    submitData.append('image', imageFile)
  }

  try {
    const response = await backHomeApi.post('./donation/report_update.php', submitData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (response.data.success) {
      Swal.fire({
        title: '徵信資料已新增!',
        icon: 'success',
        confirmButtonColor: '#0E6273',
      }).then(() => {
        router.push({ name: 'report' })
      })
    } else {
      // 後端回傳 success: false
      Swal.fire({
        title: '新增失敗',
        text: response.data.message || '未知錯誤',
        icon: 'error',
        confirmButtonColor: '#E14720',
      })
    }
  } catch (error) {
    console.error('新增失敗:', error)
    console.error('Error response:', error.response)
    Swal.fire({
      title: '錯誤',
      text: error.response?.data?.message || '新增失敗，請稍後再試',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
  }
}
</script>
<template>
    <div class="pageContainer">
    <AdminHeader title="編輯徵信資料" />

      <div class="form-wrapper">
        <el-form label-width="120px" label-position="left" :model="formData">
          <el-form-item label="資料年份" required>
            <el-input
                v-model="formData.year"
                placeholder="請輸入年份"
                maxlength="50"
                style="width: 250px"
                type="number"
              />
          </el-form-item>

          <el-form-item label="圖片上傳" required>
            <div class="upload-section">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleImageChange"
                :before-upload="beforeImageUpload"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                class="custom-upload"
              >
                <el-button class="upload-trigger" >上傳檔案 +</el-button>
              </el-upload>
              <div class="imagePreview" v-if="formData.imageUrl">
              <el-image :src="formData.imageUrl" fit="cover" class="previewImg" />
            </div>
            <div class="imageHint" v-else>
              <span>支援格式：JPG、PNG、WebP，最大10MB</span>
            </div>
            </div>
          </el-form-item>

          <div class="form-footer">
            <el-button type="primary" class="btn-submit" @click="handleSubmit">儲存</el-button>
            <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
          </div>
        </el-form>
      </div>
    </div>
</template>



<style scoped lang="scss">
.pageContainer {
padding: 30px; 
  min-height: 100vh;
  box-sizing: border-box;
}
/* 表單內容排版 */
.form-wrapper {
  max-width: 900px;
  margin: 50px auto 0;
}

/* 上傳區與預覽圖並排佈局 */
.upload-section {
  display: flex;
  align-items: flex-start;
  gap: 40px;
}
.upload-trigger {
  width: 250px;
  height: 40px;
}
.preview-card {
  text-align: center;
}
.preview-img {
  width: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.file-name {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

/* 底部按鈕顏色 */
.form-footer {
  margin-top: 60px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}
.btn-submit {
  background-color: $secondary-color;
  border-color: $secondary-color;
  padding: 10px 30px;
}
.btn-cancel {
  border-color: $secondary-color;
  color: $secondary-color;
  padding: 10px 30px;
}
</style>