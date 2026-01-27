<script setup>
import { reactive } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue';
import { useRouter } from 'vue-router'

const router = useRouter()
const handleCancel = () => {
  router.push({ name: 'impact' })
}


const form = reactive({
  year: '',
})
</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="編輯我們的影響力資料" />
    <div class="form-container">
      <el-form label-width="150px">
        <el-form-item label="資料年份">
          <el-select v-model="form.year" placeholder="請選擇" style="width: 300px">
            <el-option label="2023" value="2023" />
            <el-option label="2024" value="2024" />
          </el-select>
        </el-form-item>

        <el-form-item label="數據上傳(CSV檔案)">
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
          >
            <el-button class="upload-btn">上傳檔案 +</el-button>
          </el-upload>
        </el-form-item>

        <div class="action-buttons">
          <el-button type="primary" class="submit-btn">儲存</el-button>
          <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
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
/* 表單樣式 */
.form-container {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}

.upload-btn {
  width: 300px;
  background-color: #fff;
  border: 1px solid #ccc;
}

.action-buttons {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.submit-btn {
  background-color: $secondary-color;
  border-color: $secondary-color;
  padding: 10px 30px;
}

.cancel-btn {
  border-color: $secondary-color;
  color: $secondary-color;
  padding: 10px 30px;
}
</style>