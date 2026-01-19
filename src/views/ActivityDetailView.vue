<script setup>
import { ref, computed } from 'vue'
import ActivityTabs from '@/components/activity/ActivityTabs.vue'
import ActivityForm from '@/components/activity/ActivityForm.vue'
import ActivityResult from '@/components/activity/ActivityResult.vue'
import ActivitySignUpList from '@/components/activity/ActivitySignUpList.vue'
import ActivityComments from '@/components/activity/ActivityComments.vue'

// 1. 引入 JSON 資料
import ActivityData from '@/assets/data/activityData.json'

const activeTab = ref('detail')

// 模擬：假設我們正在查看 ID = 1 的資料 (實務上這裡會從 route.params.id 取得)
const targetId = 1
const rawData = ActivityData.find((item) => item.id === targetId)

// 2. 資料轉換邏輯 (Data Transformer)
// 將 JSON 結構轉為 Form 結構
const transformToFormData = (data) => {
  if (!data) return {}

  // 地區判斷邏輯
  let region = '其他'
  const loc = data.location
  if (
    loc.includes('基隆') ||
    loc.includes('台北') ||
    loc.includes('新北') ||
    loc.includes('桃園') ||
    loc.includes('宜蘭')
  )
    region = '北部'
  else if (
    loc.includes('台中') ||
    loc.includes('苗栗') ||
    loc.includes('彰化') ||
    loc.includes('雲林')
  )
    region = '中部'
  else if (loc.includes('高雄') || loc.includes('台南') || loc.includes('屏東')) region = '南部'
  else if (loc.includes('花蓮') || loc.includes('台東')) region = '東部'
  else if (loc.includes('澎湖') || loc.includes('綠島') || loc.includes('蘭嶼')) region = '離島'

  // 狀態對應
  let mainStatus = '草稿' // 預設值 (對應下拉選單)
  let detailStatus = '未知' // 詳細狀態 (顯示在括號內)

  // 1. 先判斷詳細狀態 (根據人數與時間)
  // 邏輯：已額滿 > 已結束 > 報名中
  const now = new Date()
  const end = new Date(data.date) // 假設這是活動結束時間

  if (data.currentPeople >= data.maxPeople) {
    detailStatus = '已額滿'
  } else if (data.status === 'ended' || now > end) {
    // 假設 JSON status 為 ended 或時間已過
    detailStatus = '已結束'
  } else {
    detailStatus = '報名中'
  }

  // 2. 判斷主狀態 (對應下拉選單的選項)
  // 如果 JSON 的 status 是 cancelled -> 取消
  // 如果 JSON 的 status 是 draft -> 草稿
  // 其他情況 (ended, upcoming, full) -> 發布
  if (data.status === 'cancelled') {
    mainStatus = '取消'
  } else if (data.status === 'draft') {
    mainStatus = '草稿'
  } else {
    mainStatus = '發布'
  }

  // 時間處理 (JSON 只有 date 字串，模擬出起訖時間)
  const startDate = new Date(data.date)
  startDate.setHours(10, 30) // 預設 10:30 開始
  const endDate = new Date(data.date)
  endDate.setHours(16, 30) // 預設 16:30 結束

  // 報名時間 (模擬：活動前一個月開始)
  const regStart = new Date(startDate)
  regStart.setMonth(regStart.getMonth() - 1)
  const regEnd = new Date(startDate)
  regEnd.setDate(regEnd.getDate() - 1)

  return {
    id: data.id.toString().padStart(2, '0'), // 補零
    category: data.type,
    region: region,
    maxVolunteers: data.maxPeople,
    currentVolunteers: data.currentPeople,

    // JSON 缺少的欄位 (Mock 資料)
    publisher: 'admin_01',
    publishTime: '2024-02-20 10:30:04',

    title: data.title,
    status: mainStatus,
    detailStatus: detailStatus,
    location: data.location,

    // Date Picker 需要陣列 [Start, End]
    activityTime: [startDate, endDate],
    registrationTime: [regStart, regEnd],

    // 將陣列轉為換行字串給 Textarea 顯示
    note: Array.isArray(data.notices) ? data.notices.join('\n') : data.notices,
    intro: data.description,

    // 圖片路徑
    imageName: data.image ? data.image.split('/').pop() : 'default.png', // 取檔名
    imageUrl: data.image,
  }
}

// 3. 產生給表單用的資料物件
const currentActivityForm = computed(() => transformToFormData(rawData))
</script>

<template>
  <div class="common-layout">
    <el-container style="height: 100vh">
      <el-main style="background-color: #f4f4f4; padding: 0">
        <ActivityTabs v-model="activeTab" />

        <div v-if="activeTab === 'detail'">
          <ActivityForm :form-data="currentActivityForm" :key="currentActivityForm.id" />
        </div>

        <div v-else-if="activeTab === 'list'">
          <ActivitySignUpList
            :activity-id="currentActivityForm.id"
            :activity-title="currentActivityForm.title"
          />
        </div>

        <div v-else-if="activeTab === 'result'">
          <ActivityResult
            :activity-id="currentActivityForm.id"
            :activity-title="currentActivityForm.title"
            :results-data="rawData.results"
            :cover-image="currentActivityForm.imageUrl"
          />
        </div>

        <div v-else-if="activeTab === 'comment'">
          <ActivityComments
            :activity-id="currentActivityForm.id"
            :activity-title="currentActivityForm.title"
            :raw-messages="rawData.messages"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>
