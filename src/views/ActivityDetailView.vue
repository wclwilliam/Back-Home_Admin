<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'
import ActivityForm from '@/components/activity/ActivityForm.vue'
import ActivityResult from '@/components/activity/ActivityResult.vue'
import ActivitySignUpList from '@/components/activity/ActivitySignUpList.vue'
import ActivityReviews from '@/components/activity/ActivityReviews.vue'
import CommonTabs from '@/components/activity/CommonTabs.vue'

import { backHomeApi, APIBase } from '@/utils/publicApi'
import ResultData from '@/assets/data/activityResultData.json'
import ReviewData from '@/assets/data/activityReview.json'
import ReportData from '@/assets/data/activityReview_Report.json'

const route = useRoute()
const activeTab = ref('detail')

const url = `/activity/admin_activity_get.php`
const rawActivityData = ref(null)
//取得各項活動的資料
const targetId = computed(() => (route.params.id ? parseInt(route.params.id) : null))

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
  let mainStatus = '草稿'
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
  let detailStatus = '未知'
  const now = new Date()
  const actStart = new Date(data.ACTIVITY_START_DATETIME.replace(' ', 'T'))
  const actEnd = new Date(data.ACTIVITY_END_DATETIME.replace(' ', 'T'))
  const signupEnd = new Date(data.ACTIVITY_SIGNUP_END_DATETIME.replace(' ', 'T'))
  const regEnd = new Date(data.ACTIVITY_SIGNUP_END_DATETIME.replace(' ', 'T'))

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
  const imagePath = data.ACTIVITY_COVER_IMAGE
    ? `${APIBase}uploads/actCover/${data.ACTIVITY_COVER_IMAGE}`
    : ''

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
    registrationTime: [data.ACTIVITY_CREATED_AT, regEnd],
    intro: data.ACTIVITY_DESCRIPTION,
    note: data.ACTIVITY_NOTES,
    imageName: data.ACTIVITY_COVER_IMAGE
      ? data.ACTIVITY_COVER_IMAGE.split('/').pop()
      : 'default.jpg',
    imageUrl: imagePath,
    isNew: false,
  }
}

const currentActivityForm = computed(() => {
  return transformToFormData(rawActivityData.value)
})

const fetchActivityData = async () => {
  if (!targetId.value) return // 如果是新增模式就不撈資料

  try {
    const response = await backHomeApi.get(`${url}?activity_id=${targetId.value}`)
    if (response.data.status === 'success') {
      rawActivityData.value = response.data.data
    } else {
      console.error('後端回傳錯誤:', response.data.message)
    }
  } catch (error) {
    console.error('獲取活動資料失敗:', error)
    return []
  }
}

const reviewUrl = `/activity/admin_activity_review_list.php`
const reviewsList = ref([])

const fetchReviews = async () => {
  if (!targetId.value) return

  try {
    const response = await backHomeApi.get(`${reviewUrl}?activity_id=${targetId.value}`)
    if (response.data.status === 'success') {
      reviewsList.value = Array.isArray(response.data.data) ? response.data.data : []
    } else {
      console.error('留言資料獲取失敗:', response.data.message)
    }
  } catch (error) {
    console.error('獲取留言 API 錯誤:', error)
    return []
  }
}

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
  if (!reviewsList.value || reviewsList.value.length === 0) return []

  // 2. 整合檢舉紀錄
  return reviewsList.value.map((r) => {
    // 找出針對此留言的檢舉
    const processedReports = (r.reports || []).map((rep) => ({
      id: rep.REPORT_ID,
      reporter: rep.USER_ID,
      reason: reportReasonMap[rep.REASON] || '其他',
      time: rep.CREATED_AT,
      status: rep.REPORT_STATUS, // "待處理", "已駁回", "已處理"
    }))

    return {
      id: r.REVIEW_ID,
      memberId: r.USER_NAME || r.USER_ID,
      rating: r.RATING,
      content: r.CONTENT,
      likeCount: r.LIKE_COUNT,
      reportCount: processedReports.length, // 計算檢舉數
      reports: processedReports,
      isVisible: r.IS_VISIBLE === 1,
    }
  })
})
const activityTabs = [
  { label: '活動詳情', value: 'detail' },
  { label: '參與名單', value: 'list' },
  { label: '活動成果', value: 'result' },
  { label: '留言管理', value: 'comment' },
]

onMounted(() => {
  fetchActivityData()
  fetchReviews()
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
            :category-id="rawActivityData?.ACTIVITY_CATEGORY_ID"
            :signup-count="rawActivityData?.ACTIVITY_SIGNUP_PEOPLE"
            :cover-image="currentActivityForm.imageUrl"
          />
          <div v-else class="empty-msg">活動未結束，請結束後輸入活動的成果</div>
        </div>

        <div v-else-if="activeTab === 'comment'">
          <ActivityReviews
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
