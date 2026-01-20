<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import ActivityTabs from '@/components/activity/ActivityTabs.vue'
import ActivityForm from '@/components/activity/ActivityForm.vue'
import ActivityResult from '@/components/activity/ActivityResult.vue'
import ActivitySignUpList from '@/components/activity/ActivitySignUpList.vue'
import ActivityComments from '@/components/activity/ActivityComments.vue'
import CommonTabs from '@/components/activity/CommonTabs.vue'
// 1. 引入 JSON 資料
import ActivityData from '@/assets/data/activityData.json'

const route = useRoute()
const activeTab = ref('detail')

const activityTabs = [
  { label: '活動詳情', value: 'detail' },
  { label: '參與名單', value: 'list' },
  { label: '活動成果', value: 'result' },
  { label: '留言管理', value: 'comment' },
]
//取得各項活動的資料
const targetId = computed(() => (route.params.id ? parseInt(route.params.id) : null))
const rawData = computed(() => {
  if (!targetId.value) return null
  return ActivityData.find((item) => item.ACTIVITY_ID === targetId.value)
})
const categoryMap = {
  1: '淨灘',
  2: '巡守',
  3: '照護',
}
const getEmptyFormData = () => {
  return {
    id: '',
    region: '',
    maxVolunteers: '',
    currentVolunteers: 0,
    publisher: 'admin_01',
    publishTime: new Date().toLocaleString(),
    title: '',
    status: '草稿',
    detailStatus: '',
    location: '',
    activityTime: [],
    registrationTime: [],
    note: '',
    intro: '',
    imageName: '',
    imageUrl: '',
    isNew: true, // 標記這是新資料
  }
}
const transformToFormData = (data) => {
  if (!data) return getEmptyFormData()

  // 狀態對應
  let mainStatus = data.ACTIVITY_STATUS || '草稿'
  let detailStatus = '未知'

  // 判斷主狀態 ACTIVITY_STATUS
  // 2 (cancelled) -> 取消
  // 0 (draft) -> 草稿
  // 1 (ended, upcoming, full) -> 發布
  if (data.ACTIVITY_STATUS === '2') {
    mainStatus = '取消'
  } else if (data.ACTIVITY_STATUS === '0') {
    mainStatus = '草稿'
  } else {
    mainStatus = '發布'
  }

  // 邏輯：已結束> 進行中 > 報名截止 > 已額滿  > 報名中
  const now = new Date()
  const actStart = new Date(data.ACTIVITY_START_DATETIME)
  const actEnd = new Date(data.ACTIVITY_END_DATETIME)
  const signupEnd = new Date(data.ACTIVITY_SIGNUP_END_DATETIME)
  const regStart = new Date(data.ACTIVITY_SIGNUP_START_DATETIME)
  const regEnd = new Date(data.ACTIVITY_SIGNUP_END_DATETIME)

  if (now > actEnd) {
    detailStatus = '已結束'
  } else if (now >= actStart) {
    detailStatus = '進行中'
  } else if (now >= signupEnd) {
    detailStatus = '報名截止'
  } else if (data.ACTIVITY_SIGNUP_PEOPLE >= data.ACTIVITY_MAX_PEOPLE) {
    detailStatus = '已額滿'
  } else {
    detailStatus = '報名中'
  }

  return {
    id: data.ACTIVITY_ID.toString().padStart(2, '0'),
    category: categoryMap[data.ACTIVITY_CATEGORY_ID] || '其他',
    region: data.ACTIVITY_LOCATION_AREA,
    maxVolunteers: data.ACTIVITY_MAX_PEOPLE,
    currentVolunteers: data.ACTIVITY_SIGNUP_PEOPLE,
    publisher: `admin_${data.ADMIN_ID}`,
    publishTime: data.ACTIVITY_CREATED_AT,
    title: data.ACTIVITY_TITLE,
    status: mainStatus,
    detailStatus: detailStatus, // 這就是括號內顯示的文字
    location: data.ACTIVITY_LOCATION,
    activityTime: [actStart, actEnd],
    registrationTime: [regStart, regEnd],
    intro: data.ACTIVITY_DESCRIPTION,
    note: data.ACTIVITY_NOTES,
    imageName: data.ACTIVITY_COVER_IMAGE
      ? data.ACTIVITY_COVER_IMAGE.split('/').pop()
      : 'default.jpg',
    imageUrl: data.ACTIVITY_COVER_IMAGE,
    isNew: false,
  }
}

const currentActivityForm = computed(() => {
  if (rawData.value) {
    return transformToFormData(rawData.value)
  } else {
    return getEmptyFormData()
  }
})
const currentResults = computed(() => {
  if (rawData.value) {
    return transformToFormData(rawData.value)
  } else {
    return getEmptyFormData()
  }
})

// 處理留言資料
const currentMessages = computed(() => {
  return []
})
</script>

<template>
  <div class="common-layout">
    <el-container style="height: 100vh">
      <el-main style="background-color: #f4f4f4; padding: 0">
        <CommonTabs v-model="activeTab" :tabs="activityTabs" />

        <div v-if="activeTab === 'detail'">
          <ActivityForm :form-data="currentActivityForm" :key="currentActivityForm.id || 'new'" />
        </div>

        <div v-else-if="activeTab === 'list'">
          <ActivitySignUpList
            v-if="!currentActivityForm.isNew"
            :activity-id="currentActivityForm.id"
            :activity-title="currentActivityForm.title"
          />
          <div v-else class="empty-msg">活動未發布，尚未有名單</div>
        </div>

        <div v-else-if="activeTab === 'result'">
          <ActivityResult
            v-if="!currentActivityForm.isNew"
            :activity-id="currentActivityForm.id"
            :activity-title="currentActivityForm.title"
            :results-data="currentResults"
            :cover-image="currentActivityForm.imageUrl"
          />
          <div v-else class="empty-msg">活動未結束，請結束後輸入活動的成果</div>
        </div>

        <div v-else-if="activeTab === 'comment'">
          <ActivityComments
            v-if="!currentActivityForm.isNew"
            :activity-id="currentActivityForm.id"
            :activity-title="currentActivityForm.title"
            :raw-messages="currentMessages"
          />
          <div v-else class="empty-msg">活動未結束，目前無人留言</div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<style scoped>
.empty-msg {
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 16px;
}
</style>
