<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'
import ActivityForm from '@/components/activity/ActivityForm.vue'
import ActivityResult from '@/components/activity/ActivityResult.vue'
import ActivitySignUpList from '@/components/activity/ActivitySignUpList.vue'
import ActivityComments from '@/components/activity/ActivityComments.vue'
import CommonTabs from '@/components/activity/CommonTabs.vue'
// 1. 引入 JSON 資料
import ActivityData from '@/assets/data/activityData.json'
import ResultData from '@/assets/data/activityResultData.json'
import ReviewData from '@/assets/data/activityReview.json'
import ReportData from '@/assets/data/activityReview_Report.json'

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
  const actStart = new Date(data.ACTIVITY_START_DATETIME.replace('T', ' '))
  const actEnd = new Date(data.ACTIVITY_END_DATETIME.replace('T', ' '))
  const signupEnd = new Date(data.ACTIVITY_SIGNUP_END_DATETIME.replace('T', ' '))
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
  if (!targetId.value) return []
  return ResultData.filter((item) => item.ACTIVITY_ID === targetId.value)
})

const reportReasonMap = {
  1: '含有仇恨、歧視性內容',
  2: '商業廣告或垃圾訊息',
  3: '內容與事實不符',
  4: '其他原因',
}
// 處理留言資料
const currentMessages = computed(() => {
  if (!targetId.value) return []

  // 1. 找出此活動的所有留言
  const reviews = ReviewData.filter((r) => r.ACTIVITY_ID === targetId.value)

  // 2. 整合檢舉紀錄
  return reviews.map((r) => {
    // 找出針對此留言的檢舉
    const reports = ReportData.filter((rep) => rep.REVIEW_ID === r.REVIEW_ID).map((rep) => ({
      id: rep.REPORT_ID,
      reporter: rep.USER_ID,
      reason: reportReasonMap[rep.REASON] || '其他',
      time: rep.CREATED_AT,
      status: rep.REPORT_STATUS, // "待處理", "已駁回", "已處理"
    }))

    return {
      id: r.REVIEW_ID,
      memberId: r.USER_ID,
      rating: r.RATING,
      content: r.CONTENT,
      likeCount: r.LIKE_COUNT,
      reportCount: reports.length, // 計算檢舉數
      reports: reports,
      isVisible: r.IS_VISIBLE === 1,
    }
  })
})
</script>

<template>
  <div class="pageContainer">
    <el-container style="height: 100vh">
      <el-main style="background-color: #f4f4f4; padding: 0">
        <AdminHeader title="志工活動詳情管理" />
        <div class="info-bar">
          <span class="label">活動編號：</span>
          <span class="val" style="margin-right: 30px">{{ currentActivityForm.id }}</span>
          <span class="label">活動名稱：</span>
          <span class="val">{{ currentActivityForm.title }}</span>
        </div>
        <CommonTabs v-model="activeTab" :tabs="activityTabs" />

        <div v-if="activeTab === 'detail'">
          <ActivityForm :form-data="currentActivityForm" :key="currentActivityForm.id || 'new'" />
        </div>

        <div v-else-if="activeTab === 'list'">
          <ActivitySignUpList
            v-if="!currentActivityForm.isNew"
            :activity-id="currentActivityForm.id"
            :activity-title="currentActivityForm.title"
            :activity-status="currentActivityForm.detailStatus"
          />
          <div v-else class="empty-msg">活動未發布，尚未有名單</div>
        </div>

        <div v-else-if="activeTab === 'result'">
          <ActivityResult
            v-if="!currentActivityForm.isNew"
            :activity-id="currentActivityForm.id"
            :activity-title="currentActivityForm.title"
            :activity-status="currentActivityForm.detailStatus"
            :results-data="currentResults"
            :category-id="rawData?.ACTIVITY_CATEGORY_ID"
            :signup-count="rawData?.ACTIVITY_SIGNUP_PEOPLE"
            :cover-image="currentActivityForm.imageUrl"
          />
          <div v-else class="empty-msg">活動未結束，請結束後輸入活動的成果</div>
        </div>

        <div v-else-if="activeTab === 'comment'">
          <ActivityComments
            v-if="!currentActivityForm.isNew"
            :activity-id="currentActivityForm.id"
            :activity-title="currentActivityForm.title"
            :activity-status="currentActivityForm.detailStatus"
            :raw-messages="currentMessages"
          />
          <div v-else class="empty-msg">活動未結束，目前無人留言</div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.pageContainer {
  padding: 30px;
  min-height: 100vh;
}
.info-content {
  display: flex;
  align-items: center;
  gap: 20px;
}
.label {
  font-weight: bold;
  color: $primary-color;
}
.val {
  color: #333;
}
.empty-msg {
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 16px;
}
</style>
