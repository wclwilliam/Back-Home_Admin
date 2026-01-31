<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'
import Swal from 'sweetalert2'
import { backHomeApi } from '@/utils/publicApi'

const getTodayDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const router = useRouter()

const formData = reactive({
  id: '自動生成',
  name: '',
  species: '綠蠵龜',
  location: '',
  status: '入院檢查',
  uploadDate: getTodayDate(),
  imageName: '',
  imageUrl: '',
  description: '',
})

// 儲存原始檔案（用於上傳）
let imageFile = null

// 表單驗證
const validateForm = () => {
  if (!formData.name.trim()) {
    Swal.fire({
      title: '錯誤',
      text: '請輸入海龜姓名',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return false
  }
  if (!formData.location.trim()) {
    Swal.fire({
      title: '錯誤',
      text: '請輸入發現地點',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return false
  }
  if (!formData.description.trim()) {
    Swal.fire({
      title: '錯誤',
      text: '請輸入受傷原因與故事文案',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return false
  }
  if (!formData.imageName) {
    Swal.fire({
      title: '錯誤',
      text: '請上傳海龜照片',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return false
  }
  return true
}

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

const goBack = () => {
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
      router.push({ name: 'rescue' })
    }
  })
}

const handleSubmit = async () => {
  if (!validateForm()) return

  // 確保圖片已上傳
  if (!imageFile) {
    Swal.fire({
      title: '錯誤',
      text: '請上傳海龜照片',
      icon: 'error',
      confirmButtonColor: '#E14720',
    })
    return
  }

  const submitData = new FormData()
  submitData.append('name', formData.name)
  submitData.append('species', formData.species)
  submitData.append('location', formData.location)
  submitData.append('status', formData.status)
  submitData.append('description', formData.description)
  submitData.append('image', imageFile)

  try {
    const response = await backHomeApi.post('./savedcases/rescue_add.php', submitData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (response.data.success) {
      Swal.fire({
        title: '救援個案已新增!',
        icon: 'success',
        confirmButtonColor: '#0E6273',
      }).then(() => {
        router.push({ name: 'rescue' })
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
    <AdminHeader title="新增救援個案" />

    <div class="formContainer">
      <el-form :model="formData" label-width="120px" label-position="left" class="customForm">
        <el-row :gutter="40">
          <el-col :span="24">
            <el-form-item label="海龜編號">
              <el-input v-model="formData.id" disabled class="readOnlyInput" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="10">
            <el-form-item label="海龜姓名" required>
              <el-input
                v-model="formData.name"
                placeholder="請輸入海龜姓名"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="10" :offset="4">
            <el-form-item label="品種" label-width="140px" required>
              <el-select v-model="formData.species" placeholder="請選擇品種" style="width: 100%">
                <el-option label="綠蠵龜" value="綠蠵龜" />
                <el-option label="玳瑁" value="玳瑁" />
                <el-option label="赤蠵龜" value="赤蠵龜" />
                <el-option label="革龜" value="革龜" />
                <el-option label="欖蠵龜" value="欖蠵龜" />
                <el-option label="肯氏龜" value="肯氏龜" />
                <el-option label="平背龜" value="平背龜" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="10">
            <el-form-item label="發現地點" required>
              <el-input
                v-model="formData.location"
                placeholder="請輸入發現地點"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="10" :offset="4">
            <el-form-item label="救治階段" label-width="140px" required>
              <el-select v-model="formData.status" placeholder="請選擇救治階段" style="width: 100%">
                <el-option label="入院檢查" value="入院檢查" />
                <el-option label="醫療照護" value="醫療照護" />
                <el-option label="休養觀察" value="休養觀察" />
                <el-option label="準備野放" value="準備野放" />
                <el-option label="重返大海" value="重返大海" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="海龜照片" required>
          <div class="uploadSection">
            <el-upload
              class="uploadBtn"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageChange"
              :before-upload="beforeImageUpload"
              accept="image/jpeg,image/jpg,image/png,image/webp"
            >
              <el-button>上傳檔案 +</el-button>
            </el-upload>

            <div class="imagePreview" v-if="formData.imageUrl">
              <el-image :src="formData.imageUrl" fit="cover" class="previewImg" />
            </div>
            <div class="imageHint" v-else>
              <span>支援格式：JPG、PNG、WebP，最大10MB</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="受傷原因與故事文案" required>
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="8"
            resize="none"
            placeholder="請輸入海龜的受傷原因與故事..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <div class="formFooter">
          <el-button class="actionBtn" plain @click="handleSubmit">儲存</el-button>
          <el-button class="actionBtn" plain @click="goBack">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}

.customForm {
  :deep(.el-form-item__label) {
    font-weight: bold;
    color: $text-color;
    letter-spacing: 1px;
  }

  //Disabled Input
  .readOnlyInput {
    :deep(.el-input__wrapper) {
      background-color: #dcdcdc;
      box-shadow: none;
      border: 1px solid #999;
    }

    :deep(.el-input__inner) {
      color: #000;
      font-weight: bold;
      text-align: center;
    }
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-color: $secondary-color;
    resize: none;
  }
}

.uploadSection {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  width: 100%;

  .uploadBtn {
    :deep(.el-button) {
      border: 1px solid $secondary-color;
      color: $secondary-color;
      width: 120px;
    }
  }

  .imagePreview {
    display: flex;
    align-items: flex-end;
    gap: 20px;

    .previewImg {
      width: 200px;
      height: 120px;
      border-radius: 4px;
      margin-bottom: 4px;
      border: 1px solid #ccc;
    }

    .fileName {
      font-size: 12px;
      color: $text-color;
    }
  }

  .imageHint {
    display: flex;
    align-items: center;
    color: #999;
    font-size: 12px;
  }
}

.formFooter {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;

  .actionBtn {
    width: 100px;
    border-color: $secondary-color;
    color: $secondary-color;
    font-weight: bold;

    &:hover {
      background-color: $secondary-color;
      color: #fff;
    }
  }
}
</style>
