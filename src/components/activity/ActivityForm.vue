<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
})

// 定義事件，當按下儲存時通知父層
const emit = defineEmits(['save'])
const router = useRouter()

// 1. 控制編輯狀態
const isEditing = ref(false)

// 備份資料用（取消編輯時還原）
let backupData = {}
onMounted(() => {
  if (props.formData.isNew) {
    // 如果是新資料，自動開啟編輯模式
    isEditing.value = true
    // 不需要備份，因為沒有舊資料可以還原
  }
})

// 開啟編輯模式
const enableEdit = () => {
  // 深層拷貝當前資料做備份
  const rawCopy = JSON.parse(JSON.stringify(props.formData))
  backupData = rawCopy
  isEditing.value = true
}

// 取消編輯
const cancelEdit = () => {
  if (props.formData.isNew) {
    router.go(-1) // 回上一頁
    return
  }

  // 還原資料
  if (backupData.activityTime && typeof backupData.activityTime[0] === 'string') {
    backupData.activityTime = [
      new Date(backupData.activityTime[0]),
      new Date(backupData.activityTime[1]),
    ]
  }
  if (backupData.registrationTime && typeof backupData.registrationTime[0] === 'string') {
    backupData.registrationTime = [
      new Date(backupData.registrationTime[0]),
      new Date(backupData.registrationTime[1]),
    ]
  }

  Object.assign(props.formData, backupData)
  isEditing.value = false
  ElMessage.info('已取消編輯')
}

// 儲存編輯
const saveEdit = () => {
  isEditing.value = false
  emit('save', props.formData)

  ElMessage.success('儲存成功')
  if (props.formData.isNew) {
    props.formData.isNew = false
  }
}
</script>

<template>
  <div class="form-container">
    <div class="section-header">
      <h2 class="section-title">核心資訊</h2>
      <template v-if="!isEditing">
        <el-button type="primary" plain class="edit-btn" @click="enableEdit"> 編輯 </el-button>
      </template>
      <template v-else>
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" @click="saveEdit">儲存</el-button>
      </template>
    </div>

    <el-form :model="formData" label-width="100px" label-position="left">
      <el-row :gutter="40">
        <el-col :span="12">
          <el-form-item label="活動編號 ">
            <el-input v-model="formData.id" disabled />
          </el-form-item>
          <el-form-item label="活動類別">
            <el-select v-model="formData.category" placeholder="請選擇類別" :disabled="!isEditing">
              <el-option label="淨灘" value="淨灘" />
              <el-option label="巡守" value="巡守" />
              <el-option label="照護" value="照護" />
            </el-select>
          </el-form-item>
          <el-form-item label="活動區域">
            <el-input v-model="formData.region" disabled />
          </el-form-item>
          <el-form-item label="最大志工人類">
            <el-input v-model="formData.maxVolunteers" :disabled="!isEditing" />
          </el-form-item>
          <el-form-item label="目前報名志工人類">
            <el-input v-model="formData.currentVolunteers" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="發布管理者帳號" class="multi-line-label">
            <el-input v-model="formData.publisher" disabled />
          </el-form-item>
          <el-form-item label="發布時間">
            <el-input v-model="formData.publishTime" disabled />
          </el-form-item>
          <el-form-item label="活動標題">
            <el-input v-model="formData.title" :disabled="!isEditing" />
          </el-form-item>
          <el-form-item label="活動狀態">
            <div style="display: flex; align-items: center; gap: 10px; width: 100%">
              <el-select
                v-model="formData.status"
                placeholder="請選擇狀態"
                :disabled="!isEditing"
                style="width: 100%"
              >
                <el-option label="草稿" value="草稿" />
                <el-option :label="'發布 ( ' + formData.detailStatus + ' )'" value="發布">
                  <span>發布</span>
                  <span
                    v-if="formData.status === '發布'"
                    style="
                      float: right;
                      color: #4fa8c3;
                      font-size: 13px;
                      font-weight: bold;
                      margin-left: 10px;
                    "
                  >
                    ( {{ formData.detailStatus }} )
                  </span>
                </el-option>
                <el-option label="取消" value="取消" />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item label="活動地點">
            <el-input v-model="formData.location" :disabled="!isEditing" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="活動時間">
        <el-date-picker
          v-model="formData.activityTime"
          type="datetimerange"
          range-separator="---"
          format="YYYY-MM-DD-HH:mm"
          :disabled="!isEditing"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="報名期間">
        <el-date-picker
          v-model="formData.registrationTime"
          type="datetimerange"
          range-separator="---"
          format="YYYY-MM-DD-HH:mm"
          :disabled="!isEditing"
          style="width: 100%"
        />
      </el-form-item>

      <h2 class="section-title" style="margin-top: 30px">詳細活動內容</h2>

      <el-form-item label="活動簡介">
        <el-input
          v-model="formData.intro"
          type="textarea"
          :rows="5"
          :disabled="!isEditing"
          resize="none"
        />
      </el-form-item>

      <el-form-item label="注意事項">
        <el-input
          v-model="formData.note"
          type="textarea"
          :rows="6"
          :disabled="!isEditing"
          resize="none"
        />
      </el-form-item>

      <el-form-item label="封面照片">
        <div class="upload-area">
          <el-upload action="#" :auto-upload="false" :show-file-list="false">
            <el-button class="upload-btn">上傳檔案 +</el-button>
          </el-upload>
          <span>測試.png</span>
        </div>
        <div class="image-placeholder"></div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
$disable-col: #dcdcdc;
$highlight-color1: #4fa8c3;
.form-container {
  padding: 20px 40px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-title {
  color: $primary-color;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}
.edit-btn {
  width: 100px;
  color: $primary-color;
  font-weight: bold;
}
.upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.upload-btn {
  width: 120px;
  border: 1px solid $disable-col;
  background: #cccccc;
}
.image-placeholder {
  width: 200px;
  height: 150px;
  background-color: $disable-col;
  margin-top: 10px;
}

/* Form Styles */
:deep(.el-form-item__label) {
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  display: flex;
  align-items: center;
}
.multi-line-label :deep(.el-form-item__label) {
  white-space: pre-line;
}
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 0;
  box-shadow: 0 0 0 1px #888 inset;
}
:deep(.is-disabled .el-input__wrapper),
:deep(.is-disabled .el-textarea__inner) {
  background-color: #dcdcdc;
  box-shadow: 0 0 0 1px #888 inset;
  color: #333;
}
</style>
