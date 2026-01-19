<script setup>
import { ref, watch, onMounted } from 'vue'
import { SuccessFilled } from '@element-plus/icons-vue'

const props = defineProps({
  activityId: { type: String, default: '01' },
  activityTitle: { type: String, default: '活動名稱' },
  // 接收 JSON 中的 results 物件
  resultsData: { type: Object, default: () => ({}) },
  // 接收 JSON 中的 image (作為範例圖)
  coverImage: { type: String, default: '' },
})

const resultItems = ref([])
const photoList = ref([])

// 初始化資料
onMounted(() => {
  // 1. 轉換 results 物件為陣列
  if (props.resultsData) {
    // 範例對應
    if (props.resultsData.totalWeight) {
      resultItems.value.push({
        label: '淨灘垃圾重量',
        value: props.resultsData.totalWeight,
        isEditing: false,
      })
    }
    if (props.resultsData.turtlesCared) {
      resultItems.value.push({
        label: '照護海龜數量',
        value: props.resultsData.turtlesCared,
        isEditing: false,
      })
    }
    // 預設加上參與人數 (Mock)
    resultItems.value.push({ label: '參與志工人類', value: '40/40', isEditing: false })
  }

  // 2. 初始化圖片 (使用 props.coverImage 重複幾次來模擬相簿)
  if (props.coverImage) {
    photoList.value = [
      { src: props.coverImage, selected: true }, // 第一張預設選中
      { src: props.coverImage, selected: false }, // 模擬第二張
    ]
  }
})

const addItem = () => {
  resultItems.value.push({ label: '', value: '', isEditing: true })
}

const removeItem = (index) => {
  resultItems.value.splice(index, 1)
}
</script>

<template>
  <div class="tab-container">
    <div class="info-bar">
      <span class="label">活動編號</span>
      <span class="val" style="margin-right: 30px">{{ activityId }}</span>
      <span class="label">活動名稱</span> <span class="val">{{ activityTitle }}</span>
    </div>

    <div class="custom-table">
      <div class="table-header">
        <div class="col-type">成果種類 (下拉選單)</div>
        <div class="col-value">數值/內容 (Input)</div>
        <div class="col-action">操作</div>
      </div>

      <div v-for="(item, index) in resultItems" :key="index" class="table-row">
        <div class="col-type">
          <span v-if="!item.isEditing">{{ item.label }}</span>
          <el-input v-else v-model="item.label" placeholder="輸入種類" />
        </div>
        <div class="col-value">
          <span v-if="!item.isEditing">{{ item.value }}</span>
          <el-input v-else v-model="item.value" placeholder="輸入數值" />
        </div>
        <div class="col-action">
          <template v-if="!item.isEditing">
            <el-link class="link-btn" @click="item.isEditing = true">編輯</el-link> /
            <el-link class="link-btn" @click="removeItem(index)">刪除</el-link>
          </template>
          <template v-else>
            <el-link class="link-btn" @click="item.isEditing = false">完成</el-link>
          </template>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: 15px">
      <el-button class="add-btn" @click="addItem">新增</el-button>
    </div>

    <div class="photo-section">
      <div class="section-header">
        <h3>成果照片</h3>
        <div class="photo-actions">
          <el-button class="action-btn outline">全選圖片</el-button>
          <el-button class="action-btn outline">刪除</el-button>
        </div>
      </div>

      <div class="photo-grid">
        <div class="photo-item upload-block">
          <el-upload action="#" :auto-upload="false" :show-file-list="false">
            <el-button class="inner-upload-btn">上傳檔案 +</el-button>
          </el-upload>
        </div>

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

        <div class="photo-item placeholder"></div>
        <div class="photo-item placeholder"></div>
        <div class="photo-item placeholder"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-container {
  padding: 20px 40px;
}

.info-bar {
  margin-bottom: 20px;
  font-size: 16px;
}
.label {
  font-weight: bold;
  color: #102a43;
  margin-right: 10px;
}
.val {
  color: #333;
}

/* 自定義表格 CSS Grid */
.custom-table {
  border: 1px solid #ccc;
}
.table-header {
  display: flex;
  background-color: #dbe4e8;
  font-weight: bold;
  padding: 15px;
  border-bottom: 1px solid #ccc;
}
.table-row {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: #fff;
  align-items: center;
}
.col-type {
  flex: 1;
  padding-right: 10px;
}
.col-value {
  flex: 1;
  text-align: center;
}
.col-action {
  width: 150px;
  text-align: right;
}

.link-btn {
  font-size: 14px;
  text-decoration: underline;
  color: #333;
  cursor: pointer;
}
.link-btn:hover {
  color: #2c6e88;
}

.add-btn {
  border: 2px solid #2c6e88;
  color: #2c6e88;
  font-weight: bold;
  background: #fff;
  padding: 8px 25px;
  border-radius: 0;
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
.action-btn.outline {
  border: 2px solid #2c6e88;
  color: #2c6e88;
  font-weight: bold;
  background: transparent;
  border-radius: 0;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.photo-item {
  height: 180px;
  background: #e0e0e0;
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
}
.photo-item.selected {
  border-color: #2c6e88;
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
  color: #e65d4f;
  font-size: 20px;
  background: #fff;
  border-radius: 50%;
}

.upload-block {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #999;
}
.inner-upload-btn {
  width: 100px;
  background: #ddd;
  border: 1px solid #999;
  color: #000;
}
</style>
