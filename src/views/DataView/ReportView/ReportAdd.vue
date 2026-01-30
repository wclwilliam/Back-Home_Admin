<script setup>
import { reactive,ref } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue';
import { useRouter } from 'vue-router'
import { backHomeApi } from '@/utils/publicApi';

const fileList = ref([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const router = useRouter()
const handleCancel = () => {
  router.push({ name: 'report' })
}

const form = reactive({
  year: ''
})

// 點擊放大圖示
const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url
  dialogVisible.value = true
}

// 手動執行上傳邏輯 (對接你的 PHP)
const submitUpload = async () => {
  if (fileList.value.length === 0) return alert('請先選擇圖片')

  const formData = new FormData()
  // fileList.value[0].raw 才是真正的檔案物件
  formData.append('report_file', fileList.value[0].raw)
  formData.append('data_year', '2026') 

  try {
    const res = await backHomeApi.post('http://localhost:8888/api/create_report.php', formData)
    alert('上傳成功')
  } catch (err) {
    console.error(err)
  }
}
</script>
<template>
    <div class="pageContainer">
    <AdminHeader title="新增徵信資料" />

      <div class="form-wrapper">
        <el-form label-width="120px" label-position="left">
          <el-form-item label="資料年份">
            <el-select v-model="form.year" placeholder=" " style="width: 250px">
              <el-option label="2023" value="2023" />
              <el-option label="2024" value="2024" />
            </el-select>
          </el-form-item>

          <el-form-item label="圖片上傳">
            <div class="upload-section">
              <el-upload
                action="#"
                list-type="picture"
                :auto-upload="false"
                :show-file-list="false"
                class="custom-upload"
              >
                <el-button class="upload-trigger" >上傳檔案 +</el-button>
              </el-upload>
              
              <div class="preview-card">
                <el-image style="width: 100%; height: 120px; border-radius: 4px; display: block; margin: 0 auto;"
            :src="dialogImageUrl" fit="cover" />
                <p class="file-name">測試.png</p>
              </div>
            </div>
          </el-form-item>

          <div class="form-footer">
            <el-button type="primary" class="btn-submit" @click="submitUpload">資料上傳</el-button>
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