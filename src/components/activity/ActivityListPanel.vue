<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  rawData: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['create'])

// --- 狀態與篩選 ---
const filterStatus = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(7) // 每頁顯示 7 筆，符合圖片密度

// --- 資料處理邏輯 (Computed) ---
// 1. 先將原始 JSON 轉換成 Table 需要的格式
const processedData = computed(() => {
  return props.rawData.map((item) => {
    // 判斷地區 (簡單的字串比對)
    let region = '其他'
    const loc = item.location
    if (
      loc.includes('基隆') ||
      loc.includes('台北') ||
      loc.includes('新北') ||
      loc.includes('桃園') ||
      loc.includes('新竹') ||
      loc.includes('宜蘭')
    )
      region = '北部'
    else if (
      loc.includes('台中') ||
      loc.includes('苗栗') ||
      loc.includes('彰化') ||
      loc.includes('南投') ||
      loc.includes('雲林')
    )
      region = '中部'
    else if (
      loc.includes('高雄') ||
      loc.includes('台南') ||
      loc.includes('嘉義') ||
      loc.includes('屏東')
    )
      region = '南部'
    else if (loc.includes('花蓮') || loc.includes('台東')) region = '東部'
    else if (
      loc.includes('澎湖') ||
      loc.includes('綠島') ||
      loc.includes('蘭嶼') ||
      loc.includes('金門')
    )
      region = '離島'

    // 判斷狀態顯示文字
    let displayStatus = '未知'
    if (item.currentPeople >= item.maxPeople) displayStatus = '已額滿'
    else if (item.status === 'ended') displayStatus = '已結束'
    else if (item.status === 'upcoming') displayStatus = '報名中'
    else if (item.status === 'cancelled') displayStatus = '取消'

    // 補編號 (如果是 1 -> 01)
    const formattedId = item.id.toString().padStart(2, '0')

    // 模擬發布時間 (因為 JSON 沒有，我們用活動日期推算往前一個月)
    const pDate = new Date(item.date)
    pDate.setMonth(pDate.getMonth() - 1)
    const publishDateStr = pDate.toISOString().split('T')[0]

    return {
      ...item,
      formattedId,
      region,
      displayStatus,
      locationName: item.location.split(' ')[0], // 簡單取地點名稱
      publishDate: publishDateStr,
      publishTime: '10:30:04',
    }
  })
})

// 2. 篩選 (搜尋 + 狀態)
const filteredData = computed(() => {
  return processedData.value.filter((item) => {
    const matchStatus = filterStatus.value
      ? item.status === filterStatus.value ||
        (filterStatus.value === 'full' && item.currentPeople >= item.maxPeople)
      : true
    const matchKeyword = searchKeyword.value
      ? item.title.includes(searchKeyword.value) || item.location.includes(searchKeyword.value)
      : true
    return matchStatus && matchKeyword
  })
})

// 3. 分頁
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})
</script>

<template>
  <div class="panel-container">
    <div class="control-bar">
      <div class="left-controls">
        <el-select
          v-model="filterStatus"
          placeholder="狀態"
          class="custom-select"
          style="width: 120px"
        >
          <el-option label="全部" value="" />
          <el-option label="報名中" value="upcoming" />
          <el-option label="已結束" value="ended" />
          <el-option label="已額滿" value="full" />
        </el-select>

        <el-input
          v-model="searchKeyword"
          placeholder="搜尋活動名稱 / 地點"
          class="custom-input"
          style="width: 250px"
        >
          <template #suffix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-button class="create-btn" @click="$emit('create')">建立活動</el-button>
    </div>

    <el-table
      :data="paginatedData"
      style="width: 100%"
      header-row-class-name="custom-header"
      :row-style="{ height: '65px' }"
    >
      <el-table-column prop="formattedId" label="活動編號" align="center" width="80">
        <template #default="scope">
          <span style="padding-left: 10px">{{ scope.row.formattedId }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="title" label="活動標題" show-overflow-tooltip>
        <template #default="scope">
          <span style="font-weight: 500; color: #333">{{ scope.row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column label="狀態" align="center">
        <template #default="scope">
          <span>{{ scope.row.displayStatus }}</span>
        </template>
      </el-table-column>

      <el-table-column label="活動時間">
        <template #default="scope">
          <div style="line-height: 1.4; font-size: 13px">
            <div>{{ scope.row.date }} (六)</div>
            <div style="color: #666">10:30 ~ 15:00</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="locationName" label="活動地點" show-overflow-tooltip />

      <el-table-column prop="type" label="分類" align="center" />

      <el-table-column label="報名狀況" align="center">
        <template #default="scope">
          {{ scope.row.currentPeople }}/{{ scope.row.maxPeople }}
        </template>
      </el-table-column>

      <el-table-column label="發布時間">
        <template #default="scope">
          <div style="font-size: 12px; line-height: 1.4">
            <div>{{ scope.row.publishDate }}</div>
            <div>{{ scope.row.publishTime }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default>
          <el-link style="font-weight: bold; color: #000" underline="always">管理</el-link>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="prev, pager, next"
        :total="filteredData.length"
        class="custom-pagination"
      />
    </div>
  </div>
</template>

<style scoped>
/* 整體容器背景透明，由父層決定 */
.panel-container {
  background: transparent;
}

/* --- Control Bar --- */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid #b0c4de;
  border-bottom: 1px solid #b0c4de;
  margin-bottom: 0;
}
.left-controls {
  display: flex;
  gap: 10px;
}

/* 覆寫 Element Plus Input/Select 樣式以符合設計稿 (方正、白底) */
:deep(.custom-select .el-input__wrapper),
:deep(.custom-input .el-input__wrapper) {
  border-radius: 0;
  box-shadow: 0 0 0 1px #8daac1 inset; /* 藍灰色邊框 */
  background-color: #fff;
}
:deep(.custom-select .el-input__inner),
:deep(.custom-input .el-input__inner) {
  color: #102a43;
  font-weight: 500;
}

/* 建立按鈕 */
.create-btn {
  border-radius: 0;
  border: 2px solid #2c6e88;
  color: #2c6e88;
  font-weight: bold;
  background: #fff;
  padding: 18px 25px;
}
.create-btn:hover {
  background: #2c6e88;
  color: white;
}

/* --- Table --- */
/* 表頭樣式 */
:deep(.custom-header th.el-table__cell) {
  background-color: #dbe4e8 !important; /* 灰藍底 */
  color: #102a43;
  font-weight: bold;
  border-bottom: 1px solid #aebac3;
  height: 50px;
}

/* 表格本體 */
:deep(.el-table) {
  --el-table-header-bg-color: #dbe4e8;
  --el-table-row-hover-bg-color: #f0f4f8;
  background-color: transparent;
}
:deep(.el-table__inner-wrapper::before) {
  display: none; /* 移除底部那條預設線 */
}
:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #dcdfe6;
}

/* --- Pagination --- */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-bottom: 20px;
}

/* 模擬圖片中的分頁樣式 (數字下底線) */
:deep(.el-pagination .el-pager li) {
  background: transparent;
  border-bottom: 3px solid #ccc;
  border-radius: 0;
  margin: 0 8px;
  color: #999;
  font-weight: bold;
  font-size: 16px;
  height: 30px;
  line-height: 26px;
}
:deep(.el-pagination .el-pager li.is-active) {
  color: #102a43;
  border-bottom-color: #102a43;
}
:deep(.el-pagination button) {
  background-color: transparent;
}
</style>
