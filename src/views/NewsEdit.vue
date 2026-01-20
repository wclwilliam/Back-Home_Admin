<template>
  <div class="pageContainer">
    <div class="headerSection">
      <h2 class="pageTitle">新增最新消息</h2>
      <div class="userInfo">
        <span>管理者帳號</span>
        <el-button size="small" plain>登出</el-button>
      </div>
    </div>

    <div class="formContainer">
      <el-form 
        :model="formData" 
        label-width="100px" 
        label-position="left"
        class="customForm"
      >
        
        <el-row :gutter="40">
          <el-col :span="10">
            <el-form-item label="文章編號">
              <el-input v-model="formData.id" disabled class="readOnlyInput" />
            </el-form-item>
          </el-col>
          <el-col :span="10" :offset="2">
            <el-form-item label="發布管理者帳號" label-width="120px">
              <el-input v-model="formData.admin" disabled class="readOnlyInput" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="標題">
          <el-input v-model="formData.title" placeholder="請輸入標題" />
        </el-form-item>

        <el-row :gutter="40">
          <el-col :span="10">
            <el-form-item label="分類">
              <el-select v-model="formData.category" placeholder="請選擇分類" style="width: 100%">
                <el-option label="重要公告" value="important" />
                <el-option label="活動通知" value="activity" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10" :offset="2">
            <el-form-item label="日期" label-width="120px">
               <el-date-picker
                v-model="formData.date"
                type="date"
                placeholder="選擇日期"
                style="width: 100%"
                format="YYYY/MM/DD"
                value-format="YYYY/MM/DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="圖片上傳">
          <div class="uploadSection">
            <el-upload
              class="uploadBtn"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageChange"
            >
              <el-button>上傳檔案 +</el-button>
            </el-upload>
            
            <div class="imagePreview" v-if="formData.imageUrl">
              <el-image 
                :src="formData.imageUrl" 
                fit="cover" 
                class="previewImg"
              />
              <span class="fileName">{{ formData.imageName }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="文字內容">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="10"
            placeholder="請輸入內容..."
          />
        </el-form-item>

        <div class="formFooter">
          <el-button class="actionBtn" type="primary" plain>發布</el-button>
          <el-button class="actionBtn" plain>儲存草稿</el-button>
          <el-button class="actionBtn" plain @click="goBack">取消</el-button>
        </div>

      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

// 定義表單資料
const formData = reactive({
  id: '01',
  admin: 'cathy',
  title: '',
  category: 'important',
  date: '2025/12/19',
  content: '',
  imageUrl: 'https://placehold.co/600x400?text=Turtle+Preview', // 預設先放一張假圖模擬
  imageName: '測試.png'
})

// 模擬圖片上傳選取後的動作
const handleImageChange = (uploadFile: any) => {
  formData.imageName = uploadFile.name
  // 建立本地預覽網址
  formData.imageUrl = URL.createObjectURL(uploadFile.raw!)
}

const goBack = () => {
  console.log('返回上一頁')
  // router.back() 
}
</script>

<style  lang="scss" scoped>

.pageContainer {
padding: 30px; 
  min-height: 100vh;
  box-sizing: border-box;
}

.headerSection {
  border-bottom: 2px solid $primary-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;

  .pageTitle { 
    font-size: 36px;
    color: $primary-color;
    font-weight: bold;
    margin: 0;
  }

  .userInfo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: $text-color;
  }
}

.formContainer {
  max-width: 900px; 
  margin: 0 auto;   
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
      //-webkit-text-fill-color: #000; 
    }
  }

  /* 一般輸入框樣式微調 */
  :deep(.el-input__wrapper), :deep(.el-textarea__inner) {
    border-color: $secondary-color;
   
  }
}


.uploadSection {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  width: 100%;

  .uploadBtn {
    :deep(.el-button) {
      background-color: #e6e6e6;
      border: 1px solid #999;
      color: #333;
      width: 120px;
    }
  }

  .imagePreview {
    display: flex;
    flex-direction: column;
    align-items: flex-end; 
    
    .previewImg {
      width: 200px;
      height: 120px;
      border-radius: 4px;
      margin-bottom: 4px;
      border: 1px solid #ccc;
    }

    .fileName {
      font-size: 12px;
      color: #666;
    }
  }
}

.formFooter {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end; 
  gap: 16px;

  .actionBtn {
    width: 100px;
    border-color:$secondary-color;
    color: $secondary-color;
    font-weight: bold;
    
    &:hover {
      background-color:$secondary-color;
      color: #fff;
    }
  }
}
</style>