<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  rawData: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['create'])
const router = useRouter()

// 路由跳轉邏輯
const handleEdit = (row) => {
  router.push({
    name: 'activityEdit',
    params: { id: row.id },
  })
}

const handleCreate = () => {
  router.push({
    name: 'activityCreate',
  })
}

const goToDetail = (row) => {
  handleEdit(row)
}

// --- 狀態與篩選 ---
const filterStatus = ref('')
const filterType = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(7)

const categoryMap = {
  1: '淨灘',
  2: '巡守',
  3: '照護',
}
// --- 資料處理邏輯 (保留原本邏輯) ---
const processedData = computed(() => {
  return props.rawData.map((data) => {
    // 活動狀態判斷
    let detailStatus = '未知'
    // 邏輯：已結束> 進行中 > 報名截止 > 已額滿  > 報名中
    const now = new Date()
    const actStart = new Date(data.ACTIVITY_START_DATETIME)
    const actEnd = new Date(data.ACTIVITY_END_DATETIME)
    const signupEnd = new Date(data.ACTIVITY_SIGHUP_END_DATETIME)

    if (now > actEnd) {
      detailStatus = '已結束'
    } else if (now >= actStart) {
      detailStatus = '進行中'
    } else if (now > signupEnd) {
      detailStatus = '報名截止'
    } else if (data.ACTIVITY_SIGNUP_PEOPLE >= data.ACTIVITY_MAX_PEOPLE) {
      detailStatus = '已額滿'
    } else {
      detailStatus = '報名中'
    }

    // 日期與時間格式化，要顯示星期幾
    const toTW = (date) => new Date(date.getTime() + 28800000)
    const twStart = toTW(actStart)
    const dateStr = twStart.toISOString().split('T')[0]
    const weekDay = ['日', '一', '二', '三', '四', '五', '六'][twStart.getUTCDay()]
    const dateDisplay = `${dateStr}(${weekDay})`

    const timeDisplay = `${toTW(actStart).toISOString().slice(11, 16)} ~ ${toTW(actEnd).toISOString().slice(11, 16)}`

    const pubTw = toTW(new Date(data.ACTIVITY_CREATED_AT))

    const publishDate = pubTw.toISOString().split('T')[0]
    const publishTime = pubTw.toISOString().slice(11, 19)

    return {
      id: data.ACTIVITY_ID,
      formattedId: data.ACTIVITY_ID.toString().padStart(2, '0'),
      title: data.ACTIVITY_TITLE,
      detailStatus: detailStatus,
      dateDisplay: dateDisplay,
      location: data.ACTIVITY_LOCATION,
      type: categoryMap[data.ACTIVITY_CATEGORY_ID] || '其他',
      area: data.ACTIVITY_LOCATION_AREA,
      currentPeople: data.ACTIVITY_SIGNUP_PEOPLE,
      maxPeople: data.ACTIVITY_MAX_PEOPLE,
      publishDate: publishDate,
      publishTime: data.ACTIVITY_CREATED_AT,
    }
  })
})
const filteredData = computed(() => {
  return processedData.value.filter((data) => {
    const matchStatus = filterStatus.value ? data.detailStatus === filterStatus.value : true
    const matchType = filterType.value ? data.type === filterType.value : true
    const matchKeyword = searchKeyword.value
      ? data.title.includes(searchKeyword.value) || data.location.includes(searchKeyword.value)
      : true
    return matchStatus && matchType && matchKeyword
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})
</script>

<template>
  <div class="panel-container">
    <div class="toolbarSection">
      <div class="filters">
        <el-select
          v-model="filterStatus"
          placeholder="狀態"
          style="width: 120px; margin-right: 12px"
        >
          <el-option label="全部" value="" />
          <el-option label="報名中" value="報名中" />
          <el-option label="已結束" value="已結束" />
          <el-option label="已額滿" value="已額滿" />
          <el-option label="進行中" value="進行中" />
        </el-select>

        <el-select v-model="filterType" placeholder="分類" style="width: 120px; margin-right: 12px">
          <el-option label="全部" value="" />
          <el-option label="淨灘" value="淨灘" />
          <el-option label="巡守" value="巡守" />
          <el-option label="照護" value="照護" />
        </el-select>

        <el-input
          v-model="searchKeyword"
          placeholder="搜尋活動名稱 / 地點"
          clearable
          style="width: 200px"
        >
          <template #suffix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-button plain class="addBtn" @click="handleCreate">建立活動</el-button>
    </div>

    <el-table
      :data="paginatedData"
      style="width: 100%"
      class="customTable"
      header-row-class-name="tableHeader"
    >
      <el-table-column prop="formattedId" label="活動編號" align="center" width="100" />

      <el-table-column
        prop="title"
        label="活動標題"
        min-width="100"
        align="left"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span style="font-weight: 500">{{ scope.row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column label="狀態" align="center" width="90">
        <template #default="scope">
          <span>{{ scope.row.detailStatus }}</span>
        </template>
      </el-table-column>

      <el-table-column label="活動時間" width="160" align="center">
        <template #default="scope">
          <div style="line-height: 1.4; font-size: 13px">
            <div>{{ scope.row.dateDisplay }}</div>
            <div style="color: #666">{{ scope.row.timeDisplay }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="location"
        label="活動地點"
        width="120"
        show-overflow-tooltip
        align="center"
      />

      <el-table-column prop="type" label="分類" width="80" align="center" />
      <el-table-column prop="area" label="地區" width="80" align="center" />

      <el-table-column label="報名狀況" align="center" width="100">
        <template #default="scope">
          {{ scope.row.currentPeople }}/{{ scope.row.maxPeople }}
        </template>
      </el-table-column>

      <el-table-column label="發布時間" width="120" align="center">
        <template #default="scope">
          <div style="font-size: 12px; line-height: 1.4">
            <div>{{ scope.row.publishTime }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="goToDetail(scope.row)"
            >管理</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="paginationSection">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        layout="prev, pager, next"
        :total="filteredData.length"
        class="mt-4"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.panel-container {
  background: transparent;
}

// 工具列樣式 (對齊 NewsView)
.toolbarSection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;

  // 篩選器群組
  .filters {
    display: flex;
    align-items: center;
    // gap: 12px;
  }

  :deep(.el-input) {
    --el-input-border-color: #0e6273;
    --el-input-focus-border-color: #0e6273;
    --el-input-hover-border-color: #0e6273;
  }

  :deep(.el-select) {
    --el-border-color: #0e6273;
    --el-border-color-hover: #0e6273;
    --el-color-primary: #0e6273;
    --el-select-input-focus-border-color: #0e6273;
  }
}
// 新增按鈕樣式
.addBtn {
  border: 1px solid $secondary-color;
  color: $secondary-color;
  background: transparent;
  &:hover {
    background-color: $secondary-color;
    color: $text-white;
  }
}
.customTable {
  :deep(th.el-table__cell) {
    background-color: $backstage-bar-color;
    font-size: 14px;
    color: $text-color;
    font-weight: bold;
    border-bottom: none;
  }

  // 讓表格內容垂直置中
  :deep(.el-table__cell) {
    padding: 12px 0;
  }
}

// 分頁樣式 (對齊 NewsView)
.paginationSection {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
