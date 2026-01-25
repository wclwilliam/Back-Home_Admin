<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { SuccessFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Swal from 'sweetalert2'

const props = defineProps({
  activityId: { type: [String, Number], default: '' },
  activityTitle: { type: String, default: '' },
  activityStatus: { type: String, default: '' },
  resultsData: { type: Array, default: () => [] },
  // 活動分類 ID (1:淨灘, 2:巡守, 3:照護)
  categoryId: { type: Number, default: 1 },
  signupCount: { type: Number, default: 0 },
  coverImage: { type: String, default: '' },
})

const resultsMap = {
  0: '參與活動志工人數(人)',
  1: '垃圾總重量(公斤 (kg))',
  2: '垃圾袋數(袋)',
  3: '漁業廢棄物(件)',
  4: '塑膠瓶/蓋(個)',
  5: '發現痕跡數(道 (海龜爬痕))',
  6: '確認卵窩數(窩)',
  7: '目擊母龜數(隻)',
  8: '海龜品種',
  9: '照護海龜數(隻)',
  10: '備餐重量(公斤 (kg))',
  11: '清洗水池數(池)',
  12: '環境整理時數(小時)',
}
const metricGroups = {
  1: [0, 1, 2, 3, 4], // 淨灘
  2: [0, 5, 6, 7, 8], // 巡守
  3: [0, 9, 10, 11, 12], // 照護
}

const resultItems = ref([])
const photoList = ref([])
const currentCategoryMetrics = computed(() => {
  return metricGroups[props.categoryId] || metricGroups[1]
})
//判斷活動是否結束，結束才可以編輯
const canEditResults = computed(() => {
  return props.activityStatus === '已結束'
})

//初始化資料
const initData = () => {
  resultItems.value = []

  if (props.resultsData && props.resultsData.length > 0) {
    props.resultsData.forEach((result) => {
      if (currentCategoryMetrics.value.includes(result.METRIC_ID)) {
        resultItems.value.push({
          metricId: result.METRIC_ID,
          value: result.VALUE,
          isEditing: false, // 預設唯讀
        })
      }
    })
  }
  const hasPeopleMetric = resultItems.value.some((item) => item.metricId === 0)
  if (!hasPeopleMetric) {
    resultItems.value.unshift({
      metricId: 0,
      value: props.signupCount, // 預設帶入報名人數
      isEditing: false,
    })
  }

  if (props.coverImage && photoList.value.length === 0) {
    photoList.value = [{ src: props.coverImage, selected: true }]
  }
}

//下拉選單選項(只能使用一次)
const getOpts = (currentRow) => {
  const usedIds = resultItems.value
    .filter((item) => item !== currentRow && item.metricId !== null)
    .map((item) => item.metricId)

  return currentCategoryMetrics.value
    .filter((id) => !usedIds.includes(id)) // 排除已用
    .map((id) => ({
      label: resultsMap[id],
      value: id,
    }))
}
const addItem = () => {
  //活動未結束，提示不能新增
  if (!canEditResults.value) {
    ElMessage.warning('活動尚未結束，不能新增成果')
    return
  }

  const usedCount = resultItems.value.length
  const totalCount = currentCategoryMetrics.value.length
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
    isEditing: true, // 新增時直接進入編輯模式
  })
}

//確認input框都有內容
const confirmInput = () => {
  resultItems.value.forEach((item) => {
    item.isEditing = false
  })
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
const handlePhotoUpload = (uploadFile) => {
  photoList.value.push({
    src: URL.createObjectURL(uploadFile.raw),
    file: uploadFile.raw,
    selected: false,
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
  //刪除選取的項目
  photoList.value = photoList.value.filter((photo) => !photo.selected)
}
watch(() => props.activityId, initData)
onMounted(initData)
</script>

<template>
  <div class="tab-container">
    <div class="custom-table">
      <div class="table-header">
        <div class="col-type">成果種類 (選單)</div>
        <div class="col-value">數值/內容</div>
        <div class="col-action">操作</div>
      </div>

      <div v-for="(item, index) in resultItems" :key="index" class="table-row">
        <div class="col-type">
          <span v-if="!item.isEditing">
            {{ item.metricId !== null ? resultsMap[item.metricId] : '請選擇' }}
          </span>
          <el-select
            v-else
            v-model="item.metricId"
            placeholder="請選擇成果種類"
            style="width: 100%"
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

        <div class="col-action">
          <template v-if="!item.isEditing">
            <template v-if="canEditResults">
              <el-link class="link-btn" @click="item.isEditing = true">編輯</el-link>
              <span style="color: #ccc; margin: 0 5px">|</span>
              <el-link class="link-btn" type="danger" @click="removeItem(index)">刪除</el-link>
            </template>
            <span v-else>(唯讀)</span>
          </template>
          <template v-else>
            <el-link class="link-btn" @click="removeItem(index)">取消</el-link>
            <span style="color: #ccc; margin: 0 5px">|</span>
            <el-link
              class="link-btn"
              :disabled="item.metricId === null || !item.value"
              @click="item.metricId !== null && item.value ? (item.isEditing = false) : null"
              >完成</el-link
            >
          </template>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: 15px">
      <el-button class="add-btn" @click="addItem">新增項目</el-button>
    </div>

    <div class="photo-section">
      <div class="section-header">
        <h3>成果照片</h3>
        <div class="photo-actions">
          <el-button class="action-btn outline" @click="selectAllPhotos">全選圖片</el-button>
          <el-button class="action-btn outline" @click="handlePhotoRemove">刪除</el-button>
        </div>
      </div>

      <div class="photo-grid">
        <div
          v-for="(img, idx) in photoList"
          :key="idx"
          class="photo-item"
          :class="{ selected: img.selected }"
          @click="img.selected = !img.selected"
        >
          <img :src="img.src" class="photo-img" />
          <div class="check-icon" v-if="img.selected">
            <el-icon><SuccessFilled /></el-icon>
          </div>
        </div>
        <div class="photo-item upload-block">
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
  align-items: flex-start;
}
.col-type {
  flex: 1;
  padding-right: 10px;
}
.col-value {
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
  color: $text-color;
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
