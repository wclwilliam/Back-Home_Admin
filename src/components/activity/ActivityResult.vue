<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { SuccessFilled } from '@element-plus/icons-vue'
import Swal from 'sweetalert2'
import { APIBase, backHomeApi } from '@/utils/publicApi'

const url = `/activity/admin_activity_result_get.php`

const props = defineProps({
  activityId: { type: [String, Number], default: '' },
  activityTitle: { type: String, default: '' },
  activityStatus: { type: String, default: '' },
  signupCount: { type: Number, default: 0 },
})
const availableMetrics = ref([])
const resultItems = ref([])

const photoList = ref([])
const deletedPhotoIds = ref([])

//判斷活動是否結束，結束才可以編輯
const canEditResults = computed(() => {
  return props.activityStatus === '已結束'
})

const isGlobalEditing = ref(false)
// 新增：備份資料用 (取消時還原)
let metricsBackup = []
let photosBackup = []
let deletedPhotosBackup = []

//進入編輯模式
const enterEditMode = () => {
  if (!canEditResults.value) {
    Swal.fire({
      icon: 'warning',
      title: '活動尚未結束，不能編輯成果',
    })
    return
  }
  //深拷貝原本的資料
  metricsBackup = JSON.parse(JSON.stringify(resultItems.value))
  // 照片因為可能包含 File 物件(新上傳的)，不能直接 JSON stringify
  // 我們只備份陣列結構，新上傳的檔案若取消就丟棄
  photosBackup = photoList.value.map((p) => ({ ...p }))
  deletedPhotosBackup = [...deletedPhotoIds.value]

  isGlobalEditing.value = true
}
//取消編輯
const cancelEditMode = () => {
  resultItems.value = JSON.parse(JSON.stringify(metricsBackup))
  photoList.value = photosBackup.map((p) => ({ ...p }))
  deletedPhotoIds.value = [...deletedPhotosBackup]
  isGlobalEditing.value = false
  Swal.fire({
    icon: 'success',
    title: '已取消編輯',
  })
}
//存放舊照片
const oldPhotoList = ref([])

//初始化資料
const initData = async () => {
  resultItems.value = []
  photoList.value = []
  availableMetrics.value = [] // 重置選項
  oldPhotoList.value = []

  deletedPhotoIds.value = []

  const targetId = props.activityId
  if (!targetId) return

  try {
    const response = await backHomeApi.get(`${url}?activity_id=${targetId}`)

    if (response.data.status === 'success') {
      const { metrics, photos, options } = response.data.data

      // 下拉選單選項
      if (options && options.length > 0) {
        availableMetrics.value = options
      }
      //已儲存的數據
      if (metrics && metrics.length > 0) {
        resultItems.value = metrics.map((m) => ({
          metricId: m.METRIC_ID,
          value: m.VALUE,
          metricName: m.METRIC_NAME,
          unit: m.METRIC_UNIT,
          isEditing: false,
        }))
      }
      if (availableMetrics.value.length > 0) {
        const volunteerMetric = availableMetrics.value.find((m) =>
          m.METRIC_NAME.includes('志工人數'),
        )
        if (volunteerMetric) {
          const existingIndex = resultItems.value.findIndex(
            (item) => item.metricId === volunteerMetric.METRIC_ID,
          )

          if (existingIndex === -1) {
            resultItems.value.unshift({
              metricId: volunteerMetric.METRIC_ID,
              value: props.signupCount, // 帶入報名人數
              metricName: volunteerMetric.METRIC_NAME,
              unit: volunteerMetric.METRIC_UNIT,
              isEditing: false, // 或設為 true 讓他們確認
            })
          }
        }
      }
      if (photos && photos.length > 0) {
        photoList.value = photos.map((photo) => ({
          id: photo.PHOTO_ID || photo.photo_id,
          src: `${APIBase}uploads/actResult/${photo.PHOTO_URL || photo.photo_url}`,
          selected: false,
          name: photo.PHOTO_URL || photo.photo_url,
          isOld: true,
        }))
      }
    }
  } catch (error) {
    console.error('獲取成果資料失敗:', error)
    return []
  }
}

//下拉選單選項(只能使用一次)
const getOpts = (currentRow) => {
  const usedIds = resultItems.value
    .filter((item) => item !== currentRow && item.metricId !== null)
    .map((item) => item.metricId)

  return availableMetrics.value
    .filter((item) => !usedIds.includes(item.METRIC_ID)) // 排除已用
    .map((item) => ({
      label: item.METRIC_NAME,
      value: item.METRIC_ID,
      unit: item.METRIC_UNIT,
      name: item.METRIC_NAME,
    }))
}
const addItem = () => {
  //活動未結束，提示不能新增
  if (!canEditResults.value) {
    Swal.fire({
      icon: 'warning',
      title: '活動尚未結束，不能新增成果',
    })
    return
  }

  const usedCount = resultItems.value.length
  const totalCount = availableMetrics.value.length
  if (usedCount >= totalCount) {
    alert('已無其他可新增的成果項目')
    return
  }

  // 檢查是否有未完成的編輯項目
  const hasUnsaved = resultItems.value.some((item) => item.isEditing)
  if (hasUnsaved) {
    alert('請先完成目前成果項目的編輯')
    return
  }

  resultItems.value.push({
    metricId: null, // 尚未選擇
    value: '',
    unit: '',
    metricName: '',
    isEditing: true, // 新增時直接進入編輯模式
  })
}

// 當下拉選單改變時，同步更新單位與名稱
const handleMetricChange = (row) => {
  const selected = availableMetrics.value.find((m) => m.METRIC_ID === row.metricId)
  if (selected) {
    row.unit = selected.METRIC_UNIT
    row.metricName = selected.METRIC_NAME
  }
}

const removeItem = (index) => {
  Swal.fire({
    title: '確定要刪除嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then((result) => {
    if (result.isConfirmed) {
      resultItems.value.splice(index, 1)
    }
  })
}

const handleSave = async () => {
  // 檢查是否有正在編輯的項目
  if (resultItems.value.some((item) => item.isEditing)) {
    Swal.fire({
      icon: 'warning',
      title: '請先完成所有成果項目的編輯 (按完成)',
    })
    return
  }
  //如果都完成挑出確認儲存的燈箱
  Swal.fire({
    title: '確定要儲存嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const fd = new FormData()
        fd.append('activity_id', props.activityId)

        // 打包成果數值
        const metricsData = resultItems.value
          .filter((item) => item.metricId !== null && item.value !== '')
          .map((item) => ({
            metric_id: item.metricId,
            value: item.value,
          }))
        fd.append('results', JSON.stringify(metricsData))
        console.log('準備刪除的照片 IDs:', deletedPhotoIds.value)
        // B. 打包要刪除的照片 ID
        fd.append('deleted_photos', JSON.stringify(deletedPhotoIds.value))

        // C. 打包新上傳的照片 (有 file 屬性的才是新照片)
        photoList.value.forEach((p) => {
          if (p.file) {
            fd.append('new_photos[]', p.file)
          }
        })

        // 呼叫 API
        const resultUpdateUrl = '/activity/admin_activity_result_save.php'
        const response = await backHomeApi.post(resultUpdateUrl, fd, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.data.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: '儲存成功',
            showConfirmButton: false,
            timer: 1500,
          })
          // 重新載入資料以同步最新狀態
          isGlobalEditing.value = false
          initData()
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('儲存成果失敗:', error)
        Swal.fire({
          icon: 'error',
          title: '儲存失敗',
          text: error.message,
        })
      }
    }
  })
}

const handlePhotoUpload = (uploadFile) => {
  // 產生預覽圖並加入列表
  photoList.value.push({
    src: URL.createObjectURL(uploadFile.raw), // 預覽網址
    file: uploadFile.raw, // 原始檔案 (傳給後端用)
    selected: false,
    isOld: false, // 標記為新照片
    name: uploadFile.name,
  })
}

//全選照片
const selectAllPhotos = () => {
  photoList.value.forEach((photo) => {
    photo.selected = true
  })
}
//刪除照片
const handlePhotoRemove = () => {
  // 找出被選取的照片
  const selectedPhotos = photoList.value.filter((p) => p.selected)

  if (selectedPhotos.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: '請先選擇要刪除的照片',
    })
    return
  }

  // 遍歷選取的照片
  selectedPhotos.forEach((p) => {
    // 如果是資料庫已存在的舊照片，要記錄 ID
    if (p.isOld && p.id) {
      deletedPhotoIds.value.push(p.id)
    }
  })

  // 從畫面列表中移除這些照片
  photoList.value = photoList.value.filter((photo) => !photo.selected)
}
watch(() => props.activityId, initData)
onMounted(initData)
</script>

<template>
  <div class="update_btn" style="margin-top: 20px; text-align: right">
    <template v-if="!isGlobalEditing">
      <el-button class="add-btn" @click="enterEditMode" :disabled="!canEditResults">
        修改項目
      </el-button>
    </template>
    <template v-else>
      <el-button class="add-btn" @click="cancelEditMode">取消</el-button>
      <el-button type="primary" @click="handleSave" style="background-color: #0e6273"
        >完成修改</el-button
      >
    </template>
  </div>

  <div class="tab-container">
    <div class="custom-table">
      <div class="table-header">
        <div class="col-type">成果種類 (選單)</div>
        <div class="col-value">數值/內容</div>
        <div class="col-unit">單位</div>
        <div class="col-action" v-if="isGlobalEditing">操作</div>
        <div class="col-action" v-else></div>
      </div>

      <div v-for="(item, index) in resultItems" :key="index" class="table-row">
        <div class="col-type">
          <span v-if="!item.isEditing">
            {{ item.metricName || '請選擇' }}
          </span>
          <el-select
            v-else
            v-model="item.metricId"
            placeholder="請選擇成果種類"
            style="width: 100%"
            @change="handleMetricChange(item)"
            :disabled="!isGlobalEditing"
          >
            <el-option
              v-for="opt in getOpts(item)"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <div class="col-value">
          <span v-if="!item.isEditing">{{ item.value }}</span>
          <el-input v-else v-model="item.value" placeholder="請輸入數值或內容" />
          <span v-if="item.isEditing && item.value === ''" style="color: red; text-align: left"
            >*請輸入數值或內容</span
          >
        </div>

        <div class="col-unit" style="width: 50px">
          <span disabled>{{ item.unit }}</span>
        </div>

        <div class="col-action">
          <template v-if="isGlobalEditing">
            <template v-if="!item.isEditing">
              <el-button class="link-btn" type="primary" link @click="item.isEditing = true"
                >編輯</el-button
              >
              <span style="color: #ccc; margin: 0 5px">|</span>
              <el-button class="link-btn" type="danger" link @click="removeItem(index)"
                >刪除</el-button
              >
            </template>
            <template v-else>
              <el-button
                class="link-btn"
                type="primary"
                link
                :disabled="item.metricId === null || !item.value"
                @click="item.metricId !== null && item.value ? (item.isEditing = false) : null"
                >完成</el-button
              >
              <span style="color: #ccc; margin: 0 5px">|</span>
              <el-button link class="link-btn" type="danger" @click="item.isEditing = false"
                >取消</el-button
              >
            </template>
          </template>
          <template v-else>
            <span>(唯讀)</span>
          </template>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: 15px" v-if="isGlobalEditing">
      <el-button class="add-btn" @click="addItem">新增項目</el-button>
    </div>

    <div class="photo-section">
      <div class="section-header">
        <h3>成果照片</h3>
        <div class="photo-actions">
          <el-button class="action-btn outline" @click="selectAllPhotos" v-if="isGlobalEditing"
            >全選圖片</el-button
          >
          <el-button class="action-btn outline" @click="handlePhotoRemove" v-if="isGlobalEditing"
            >刪除</el-button
          >
        </div>
      </div>

      <div class="photo-grid">
        <div
          v-for="(img, idx) in photoList"
          :key="idx"
          class="photo-item"
          :class="{ selected: img.selected }"
          @click="isGlobalEditing ? (img.selected = !img.selected) : null"
        >
          <img :src="img.src" class="photo-img" />
          <div class="check-icon" v-if="img.selected">
            <el-icon><SuccessFilled /></el-icon>
          </div>
        </div>
        <div class="photo-item upload-block" v-if="isGlobalEditing">
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :disabled="!canEditResults"
            :on-change="handlePhotoUpload"
          >
            <el-button class="inner-upload-btn" :disabled="!canEditResults">上傳照片</el-button>
          </el-upload>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$disable-col: #dcdcdc;
$highlight-color1: #4fa8c3;
$input-line-color2: #0e6273;
$btn-bg: #cccccc;
$text-color: #333333;
$box-shadow: #aaaaaa;
$tab-col: #4fa8c3;
$highlight-color2: #e14720;
$title-col: #153450;

.tab-container {
  padding: 20px 0;
}

.info-bar {
  margin-bottom: 20px;
  font-size: 16px;
}
.label {
  font-weight: bold;
  color: $title-col;
  margin-right: 10px;
}
.val {
  color: $text-color;
}
.update_btn .add-btn {
  border: 1px solid $secondary-color;
  color: $secondary-color;
  background: $text-white;
  &:hover {
    background-color: $secondary-color;
    color: $text-white;
  }
}

/* 自定義表格 CSS Grid */
.custom-table {
  border: 1px solid $btn-bg;
}
.table-header {
  display: flex;
  background-color: $card-color;
  font-size: 14px;
  color: $text-color;
  font-weight: bold;
  border: none;
  padding: 15px;
}
.table-row {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid $disable-col;
  background: $text-white;
  align-items: center;
  min-height: 60px;
}
.col-type {
  flex: 2;
  padding-right: 10px;
}
.col-value {
  flex: 2;
  text-align: left;
}
.col-unit {
  flex: 1;
  text-align: left;
}
.col-action {
  width: 150px;
  text-align: right;
}

.link-btn {
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}
.link-btn:hover {
  color: #2c6e88;
}

.add-btn,
.action-btn.outline,
.inner-upload-btn {
  border: 1px solid $secondary-color;
  color: $secondary-color;
  background: transparent;
  &:hover {
    background-color: $secondary-color;
    color: $text-white;
  }
}
/* 照片牆 */
.photo-section {
  margin-top: 40px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.photo-actions {
  display: flex;
  gap: 10px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.photo-item {
  height: 180px;
  background: $disable-col;
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
}
.photo-item.selected {
  border-color: $input-line-color2;
}
.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.check-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  color: $highlight-color2;
  font-size: 20px;
  background: $text-white;
  border-radius: 50%;
}

.upload-block {
  display: flex;
  align-items: center;
  justify-content: center;
  background: $text-white;
  border: 1px solid $box-shadow;
}
</style>
