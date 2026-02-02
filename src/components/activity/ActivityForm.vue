<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

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
//建立本地響應式物件
const localForm = ref({})
//偵測到複層資料後存入localForm
watch(
  () => props.formData,
  (newVal) => {
    const copy = JSON.parse(JSON.stringify(newVal))
    if (copy.activityTime && Array.isArray(copy.activityTime)) {
      copy.activityTime = copy.activityTime.map((t) => (t ? new Date(t) : ''))
    }

    if (copy.registrationTime && Array.isArray(copy.registrationTime)) {
      copy.registrationTime = copy.registrationTime.map((t) => (t ? new Date(t) : ''))
    }

    localForm.value = copy
  },
  { immediate: true, deep: true },
)
//判斷活動是否已結束
const isActivityEnded = computed(() => {
  return localForm.value.detailStatus === '已結束'
})

// 限制結束時間不能早於開始時間
const disabledEndDate = (time) => {
  if (!localForm.value.registrationTime || !localForm.value.registrationTime[0]) {
    return false
  }
  const startDate = new Date(localForm.value.registrationTime[0])
  return time.getTime() < startDate.getTime()
}
// 備份資料用
let backupData = {}
onMounted(() => {
  if (localForm.value.isNew) {
    isEditing.value = true
  }
})
const enableEdit = () => {
  // 編輯前，先把目前的狀態備份起來
  const rawCopy = JSON.parse(JSON.stringify(localForm.value))
  backupData = rawCopy
  isEditing.value = true
}

const cancelEdit = () => {
  if (localForm.value.isNew) {
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
  //備份資料覆蓋localForm
  localForm.value = { ...backupData }

  //取消編輯
  isEditing.value = false
  ElMessage.info('已取消編輯')
  Swal.fire({
    icon: 'info',
    title: '已取消編輯',
    showConfirmButton: false,
    timer: 1500,
  })
}
//圖片上傳
const handleImageUpload = (uploadFile) => {
  //取得檔案名稱
  localForm.value.imageName = uploadFile.name
  //預覽
  localForm.value.imageUrl = URL.createObjectURL(uploadFile.raw)
  localForm.value.imageFile = uploadFile.raw
}
//儲存編輯
const saveEdit = () => {
  isEditing.value = false
  emit('save', localForm.value)
  ElMessage.success('儲存成功')
  if (localForm.value.isNew) {
    localForm.value.isNew = false
  }
  Swal.fire({
    icon: 'success',
    title: '儲存成功',
    showConfirmButton: false,
    timer: 1500,
  })
}
</script>

<template>
  <div class="form-container">
    <div class="section-header">
      <h2 class="section-title">活動詳細資訊</h2>
      <div class="action-buttons">
        <template v-if="!isEditing">
          <el-button
            class="actionBtn"
            plain
            @click="enableEdit"
            :title="isActivityEnded ? '活動已結束，無法編輯' : ''"
          >
            <!--  :disabled="isActivityEnded"等修改完成在加上去去-->
            <!-- {{ isActivityEnded ? '活動已結束' : '編輯' }} -->
            編輯
          </el-button>
        </template>
        <template v-else>
          <el-button class="actionBtn" plain @click="cancelEdit">取消</el-button>
          <el-button class="actionBtn" plain @click="saveEdit">儲存</el-button>
        </template>
      </div>
    </div>

    <el-form :model="localForm" label-width="100px" label-position="left" class="customForm">
      <el-row :gutter="40">
        <el-col :span="12">
          <el-form-item label="活動編號">
            <el-input v-model="localForm.id" disabled class="readOnlyInput" />
          </el-form-item>
          <el-form-item label="活動類別">
            <el-select
              v-model="localForm.category"
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
            <el-select
              v-model="localForm.region"
              placeholder="請選擇地區"
              :disabled="!isEditing"
              style="width: 100%"
            >
              <el-option label="北部" value="北部" />
              <el-option label="中部" value="中部" />
              <el-option label="東部" value="東部" />
              <el-option label="南部" value="南部" />
              <el-option label="離島" value="離島" />
            </el-select>
          </el-form-item>

          <el-form-item label="最大志工數">
            <el-input v-model="localForm.maxVolunteers" :disabled="!isEditing" />
          </el-form-item>
          <el-form-item label="目前報名數">
            <el-input v-model="localForm.currentVolunteers" disabled class="readOnlyInput" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="管理者帳號">
            <el-input v-model="localForm.publisher" disabled class="readOnlyInput" />
          </el-form-item>
          <el-form-item label="發布時間">
            <el-input v-model="localForm.publishTime" disabled class="readOnlyInput" />
          </el-form-item>
          <el-form-item label="活動標題">
            <el-input v-model="localForm.title" :disabled="!isEditing" />
          </el-form-item>
          <el-form-item label="活動狀態">
            <el-select
              v-model="localForm.status"
              placeholder="請選擇狀態"
              :disabled="!isEditing"
              style="width: 100%"
            >
              <el-option label="草稿" value="草稿" />
              <el-option :label="'發布 ( ' + localForm.detailStatus + ' )'" value="發布">
                <span>發布</span>
                <span
                  v-if="localForm.status === '發布'"
                  style="
                    float: right;
                    color: #4fa8c3;
                    font-size: 13px;
                    font-weight: bold;
                    margin-left: 10px;
                  "
                >
                  ( {{ localForm.detailStatus }} )
                </span>
              </el-option>
              <el-option label="取消" value="取消" />
            </el-select>
          </el-form-item>
          <el-form-item label="活動地點">
            <el-input v-model="localForm.location" :disabled="!isEditing" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="活動時間">
        <el-date-picker
          v-model="localForm.activityTime"
          type="datetimerange"
          range-separator="---"
          format="YYYY-MM-DD HH:mm"
          :disabled="!isEditing"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="報名期間">
        <el-date-picker
          v-model="localForm.registrationTime[0]"
          type="datetime"
          placeholder="開始時間"
          format="YYYY-MM-DD HH:mm"
          :disabled="true"
          style="flex: 1"
        />
        <el-date-picker
          v-model="localForm.registrationTime[1]"
          type="datetime"
          placeholder="結束時間"
          format="YYYY-MM-DD HH:mm"
          :disabled="!isEditing"
          :disabled-date="disabledEndDate"
          style="flex: 1"
        />
      </el-form-item>

      <el-form-item label="活動簡介">
        <el-input
          v-model="localForm.intro"
          type="textarea"
          :rows="5"
          :disabled="!isEditing"
          resize="none"
        />
      </el-form-item>

      <el-form-item label="注意事項">
        <el-input
          v-model="localForm.note"
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
            :on-change="handleImageUpload"
            :disabled="!isEditing"
          >
            <el-button :disabled="!isEditing">上傳封面照片</el-button>
          </el-upload>

          <div class="imagePreview" v-if="localForm.imageUrl">
            <el-image :src="localForm.imageUrl" fit="cover" class="previewImg" />
            <span class="fileName">{{ localForm.imageName }}</span>
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
