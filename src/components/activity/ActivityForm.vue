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

const emit = defineEmits(['save'])
const router = useRouter()

// 控制編輯狀態
const isEditing = ref(false)

// 備份資料用
let backupData = {}
onMounted(() => {
  if (props.formData.isNew) {
    isEditing.value = true
  }
})

const enableEdit = () => {
  const rawCopy = JSON.parse(JSON.stringify(props.formData))
  backupData = rawCopy
  isEditing.value = true
}

const cancelEdit = () => {
  if (props.formData.isNew) {
    router.go(-1)
    return
  }

  // 還原資料邏輯
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
  //取消編輯
  Object.assign(props.formData, backupData)
  isEditing.value = false
  ElMessage.info('已取消編輯')
}
//儲存編輯
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
      <h2 class="section-title">活動詳細資訊</h2>
      <div class="action-buttons">
        <template v-if="!isEditing">
          <el-button class="actionBtn" plain @click="enableEdit"> 編輯 </el-button>
        </template>
        <template v-else>
          <el-button class="actionBtn" plain @click="cancelEdit">取消</el-button>
          <el-button class="actionBtn" plain @click="saveEdit">儲存</el-button>
        </template>
      </div>
    </div>

    <el-form :model="formData" label-width="100px" label-position="left" class="customForm">
      <el-row :gutter="40">
        <el-col :span="12">
          <el-form-item label="活動編號">
            <el-input v-model="formData.id" disabled class="readOnlyInput" />
          </el-form-item>
          <el-form-item label="活動類別">
            <el-select
              v-model="formData.category"
              placeholder="請選擇類別"
              :disabled="!isEditing"
              style="width: 100%"
            >
              <el-option label="淨灘" value="淨灘" />
              <el-option label="巡守" value="巡守" />
              <el-option label="照護" value="照護" />
            </el-select>
          </el-form-item>
          <el-form-item label="活動區域">
            <el-input v-model="formData.region" disabled class="readOnlyInput" />
          </el-form-item>
          <el-form-item label="最大志工數">
            <el-input v-model="formData.maxVolunteers" :disabled="!isEditing" />
          </el-form-item>
          <el-form-item label="目前報名數">
            <el-input v-model="formData.currentVolunteers" disabled class="readOnlyInput" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="管理者帳號">
            <el-input v-model="formData.publisher" disabled class="readOnlyInput" />
          </el-form-item>
          <el-form-item label="發布時間">
            <el-input v-model="formData.publishTime" disabled class="readOnlyInput" />
          </el-form-item>
          <el-form-item label="活動標題">
            <el-input v-model="formData.title" :disabled="!isEditing" />
          </el-form-item>
          <el-form-item label="活動狀態">
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
          format="YYYY-MM-DD HH:mm"
          :disabled="!isEditing"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="報名期間">
        <el-date-picker
          v-model="formData.registrationTime"
          type="datetimerange"
          range-separator="---"
          format="YYYY-MM-DD HH:mm"
          :disabled="!isEditing"
          style="width: 100%"
        />
      </el-form-item>

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
        <div class="uploadSection">
          <el-upload
            class="uploadBtn"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :disabled="!isEditing"
          >
            <el-button :disabled="!isEditing">上傳檔案 +</el-button>
          </el-upload>

          <div class="imagePreview" v-if="formData.imageUrl">
            <el-image :src="formData.imageUrl" fit="cover" class="previewImg" />
            <span class="fileName">{{ formData.imageName }}</span>
          </div>
          <div class="imagePreview" v-else>
            <div class="image-placeholder"></div>
            <span class="fileName">尚未上傳</span>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
$primary-color: #0e6273;
$secondary-color: #2c6e88;
$text-color: #333333;
$disable-bg: #dcdcdc;

.form-container {
  padding: 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 2px solid $primary-color;
  padding-bottom: 10px;
}

.section-title {
  color: $primary-color;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}
//按鈕
.actionBtn {
  width: 100px;
  border: 1px solid $secondary-color;
  color: $secondary-color;
  font-weight: bold;

  &:hover {
    background-color: $secondary-color;
    color: $text-white;
  }
}

.customForm {
  :deep(.el-form-item__label) {
    font-weight: bold;
    color: $text-color;
    letter-spacing: 1px;
  }

  .readOnlyInput {
    :deep(.el-input__wrapper) {
      background-color: $disable-bg;
      box-shadow: none;
      border: 1px solid #999;
      border-radius: 4px;
    }

    :deep(.el-input__inner) {
      color: $text-color;
      font-weight: bold;
      text-align: center;
      -webkit-text-fill-color: $text-color;
    }
  }

  // 一般輸入框樣式
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select__wrapper) {
    border-radius: 4px;
    box-shadow: 0 0 0 1px $secondary-color inset;

    &.is-focus {
      box-shadow: 0 0 0 1px $primary-color inset !important;
    }
  }

  // disabled 樣式
  :deep(.el-input.is-disabled:not(.readOnlyInput) .el-input__wrapper),
  :deep(.el-textarea.is-disabled .el-textarea__inner),
  :deep(.el-select__wrapper.is-disabled) {
    background-color: $text-white;
    box-shadow: 0 0 0 1px #e4e7ed inset;
    color: $text-color;
  }
}
//圖片上傳
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

      &:hover {
        background-color: $secondary-color;
        color: $text-white;
      }
      &.is-disabled {
        background-color: $text-white;
        border-color: #e4e7ed;
        color: #a8abb2;
      }
    }
  }
  //圖片預覽
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

    .image-placeholder {
      width: 200px;
      height: 120px;
      background-color: $disable-bg;
      border: 1px dashed #999;
      margin-bottom: 4px;
    }

    .fileName {
      font-size: 12px;
      color: $text-color;
      margin-bottom: 5px; // 對齊底部
    }
  }
}
</style>
