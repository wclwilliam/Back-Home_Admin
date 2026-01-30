<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEdit.value ? '編輯救援個案' : '新增救援個案'))

const handleCancel = () => {
  router.push({ name: 'rescue' })
}

const form = reactive({
  id: '',
  name: '',
  species: '綠蠵龜',
  location: '',
  status: '入院檢查',
  imageSrc: null,
  description: '',
})

const uploadRef = ref()
const previewImageUrl = ref('')

onMounted(() => {
  if (isEdit.value) {
    // 模擬從 API 獲取資料
    form.id = route.params.id
    form.name = '阿福'
    form.species = '綠蠵龜'
    form.location = '澎湖'
    form.status = '醫療照護'
    form.description =
      '2025年10月發現於澎湖龍門沙灘，遭廢棄漁網纏繞導致左前肢壞死。阿福剛來時極度虛弱，經過截肢手術後，目前正在練習用三隻鰭狀肢游泳，每天的餐費與藥費是牠最大的支柱。'
    form.imageSrc = 'afu.jpg'
  }
})

const handleFileChange = (uploadFile) => {
  if (uploadFile.raw) {
    previewImageUrl.value = URL.createObjectURL(uploadFile.raw)
    form.imageSrc = uploadFile.name
  }
}

const handleExceed = (files) => {
  uploadRef.value.clearFiles()
  const file = files[0]
  file.uid = Date.now() // 給予新的 uid
  uploadRef.value.handleStart(file)
}

const handleRemove = () => {
  uploadRef.value.clearFiles()
  previewImageUrl.value = ''
  form.imageSrc = null
}

const handleSubmit = () => {
  console.log('Submit form:', form)
  // 這裡未來接 API
  router.push({ name: 'rescue' })
}
</script>

<template>
  <div class="pageContainer">
    <div class="header-section">
      <h2 class="page-title">{{ pageTitle }}</h2>
      <div class="user-info">
        <span>管理者帳號</span>
        <el-button size="small" plain>登出</el-button>
      </div>
    </div>
    <div class="divider"></div>

    <div class="form-container">
      <div class="form-content">
        <!-- 左側欄位 -->
        <div class="left-column">
          <div class="form-row">
            <label>數據編號</label>
            <el-input v-model="form.id" disabled placeholder="自動生成" />
          </div>

          <div class="form-row">
            <label>海龜姓名</label>
            <el-input v-model="form.name" />
          </div>

          <div class="form-row">
            <label>品種</label>
            <el-select v-model="form.species" placeholder="請選擇">
              <el-option label="綠蠵龜" value="綠蠵龜" />
              <el-option label="玳瑁" value="玳瑁" />
              <el-option label="赤蠵龜" value="赤蠵龜" />
              <el-option label="革龜" value="革龜" />
              <el-option label="欖蠵龜" value="欖蠵龜" />
              <el-option label="肯氏龜" value="肯氏龜" />
              <el-option label="平背龜" value="平背龜" />
            </el-select>
          </div>

          <div class="form-row">
            <label>救治階段</label>
            <el-select v-model="form.status" placeholder="請選擇">
              <el-option label="入院檢查" value="入院檢查" />
              <el-option label="醫療照護" value="醫療照護" />
              <el-option label="休養觀察" value="休養觀察" />
              <el-option label="準備野放" value="準備野放" />
              <el-option label="重返大海" value="重返大海" />
            </el-select>
          </div>

          <div class="form-row">
            <label>圖片上傳</label>
            <el-upload
              ref="uploadRef"
              action="#"
              :auto-upload="false"
              :limit="1"
              class="upload-demo"
              :on-change="handleFileChange"
              :on-exceed="handleExceed"
              :show-file-list="false"
            >
              <el-button class="upload-btn">上傳檔案 +</el-button>
            </el-upload>
          </div>
        </div>

        <!-- 右側欄位 -->
        <div class="right-column">
          <div class="form-row">
            <!-- 為了對齊，這裡放一個空的或者隱藏的 label -->
            <label style="visibility: hidden">發現地點</label>
            <!-- 發現地點移到右邊跟品種對齊 -->
          </div>
          <div class="form-row location-row">
            <label>發現地點</label>
            <el-input v-model="form.location" />
          </div>

          <!-- 圖片預覽區域 -->
          <div class="image-preview">
            <div class="preview-wrapper" v-if="previewImageUrl || form.photo">
              <img
                v-if="previewImageUrl"
                :src="previewImageUrl"
                alt="Preview"
                class="preview-img"
              />
              <img
                v-else-if="form.imageSrc"
                src="@/assets/images/logo.png"
                alt="Preview"
                class="preview-img"
              />
              <div class="remove-btn" @click="handleRemove">×</div>
            </div>
            <!-- 暫時用 logo 代替，實際應顯示上傳圖片 -->
            <div v-else class="placeholder"></div>
            <div class="filename" v-if="form.imageSrc">{{ form.imageSrc }}</div>
          </div>
        </div>
      </div>

      <!-- 下方文字區域 -->
      <div class="bottom-section">
        <div class="form-row full-width">
          <label>受傷原因與故事文案</label>
          <el-input v-model="form.description" type="textarea" :rows="8" resize="none" />
        </div>
      </div>

      <div class="action-buttons">
        <el-button type="primary" class="submit-btn" @click="handleSubmit">儲存</el-button>
        <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f5f7f7; // 背景色
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .page-title {
    color: #102a43;
    font-size: 24px;
    font-weight: bold;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #333;
  }
}

.divider {
  height: 1px;
  background-color: #8ca3a8;
  margin-bottom: 40px;
}

.form-container {
  max-width: 900px;
  margin: 0 auto;
}

.form-content {
  display: flex;
  gap: 50px;
  margin-bottom: 30px;
}

.left-column,
.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 20px;

  label {
    width: 80px;
    text-align: right;
    color: #333;
    font-size: 14px;
    font-weight: bold;
  }

  :deep(.el-input),
  :deep(.el-select) {
    flex: 1;
    --el-input-border-color: #8ca3a8;
  }

  .upload-btn {
    width: 100%;
    background-color: #f0f0f0;
    border: 1px solid #8ca3a8;
    color: #333;
  }
}

.location-row {
  margin-top: -60px; // 調整位置以對齊品種
  margin-bottom: 20px;
}

.image-preview {
  margin-left: 100px; // 對齊輸入框
  width: 200px;

  .preview-wrapper {
    position: relative;
    width: 200px;
    height: 150px;
    margin-bottom: 5px;
    overflow: hidden;

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background-color: #d9d9d9;
      display: block;
    }

    .remove-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      z-index: 10;
      width: 24px;
      height: 24px;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      transition: background-color 0.3s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.8);
      }
    }
  }

  .placeholder {
    width: 100%;
    height: 150px;
    background-color: #d9d9d9;
    margin-bottom: 5px;
  }

  .filename {
    text-align: right;
    font-size: 12px;
    text-decoration: underline;
    color: #666;
    word-break: break-all;
  }
}

.bottom-section {
  margin-bottom: 30px;

  .full-width {
    display: block; // 讓 label 在上方

    label {
      display: block;
      text-align: left;
      margin-bottom: 10px;
      width: 100%;
    }

    :deep(.el-textarea__inner) {
      border-color: #8ca3a8;
      background-color: #fff;
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.submit-btn {
  background-color: #0e6273;
  border-color: #0e6273;
  padding: 10px 30px;
  &:hover {
    background-color: lighten(#0e6273, 10%);
  }
}

.cancel-btn {
  background-color: #fff;
  border-color: #0e6273;
  color: #0e6273;
  padding: 10px 30px;
  &:hover {
    background-color: #f0f9fa;
  }
}
</style>
