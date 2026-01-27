<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Pagination from '@/components/Pagination.vue'

const router = useRouter()
const handleAdd = () => {
  router.push({ name: 'reportAdd' })
}

// --- 響應式狀態 ---
const sortBy = ref('newest')
const currentPage = ref(1) // 當前頁碼
const pageSize = ref(10)   // 每頁筆數

// 模擬資料
const rawData = [
    { id: '01', year: '2023', date: '2023/01/01 18:08:21', fileName: '測試.jpg' },
    { id: '02', year: '2024', date: '2024/01/03 12:12:12', fileName: '測試.jpg' },
    { id: '03', year: '2025', date: '2025/01/02 17:55:30', fileName: '測試.jpg' },
]

// 1. 處理「排序」後的完整數據
const sortedData = computed(() => {
  let result = [...rawData]
  result.sort((a, b) => {
    const timeA = new Date(a.date).getTime()
    const timeB = new Date(b.date).getTime()
    return sortBy.value === 'newest' ? timeB - timeA : timeA - timeB
  })
  
  // 每當排序改變時，建議回到第一頁
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  currentPage.value = 1
  
  return result
})

// 2. 處理「分頁」切割後的顯示數據
const displayData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedData.value.slice(start, end)
})
</script>

<template>
    <div class="toolbarSection">
            <div class="filters">
                <el-select v-model="sortBy" placeholder="排序" style="width: 120px; margin-right: 12px;">
                    <el-option label="最新" value="newest" />
                    <el-option label="最早" value="oldest" />
                </el-select>
            </div>

            <el-button plain class="addBtn" @click="handleAdd">新增資料</el-button>
        </div>

        <el-table :data="displayData" style="width: 100%" class="customTable">
            <el-table-column prop="id" label="資料編號" width="100" align="center" />
            <el-table-column prop="year" label="資料年份" width="120" align="center" />
            <el-table-column prop="date" label="上傳日期" min-width="180" align="center" />
            <el-table-column prop="fileName" label="檔案名稱" min-width="150" align="center" />

            <el-table-column label="操作" width="150" align="center">
                <template #default>
                    <div class="operation-cell">
                        <el-button link type="primary" size="small">編輯</el-button>
                        <span style="color: #dcdfe6; margin: 0 8px">|</span>
                        <el-button link type="danger" size="small">刪除</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <Pagination 
    v-model:current-page="currentPage"
    :total="sortedData.length"
  />
</template>

<style lang="scss" scoped>
    //工具列 
.toolbarSection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;

  :deep(.el-input) {
    --el-input-border-color: #0E6273;
    --el-input-focus-border-color: #0E6273;
    --el-input-hover-border-color: #0E6273; 
  }

  :deep(.el-select) {
    --el-border-color: #0E6273; 
    --el-border-color-hover: #0E6273;
    --el-color-primary: #0E6273; 
    --el-select-input-focus-border-color: #0E6273;
  }
}

.customTable {
  :deep(th.el-table__cell) {
    background-color: $card-color ; 
    font-size: 14px;
    color: $text-color;
    font-weight: bold;
    border-bottom: none;
  }
}


.paginationSection {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.addBtn {
  border-color: $secondary-color;
  color: $secondary-color;
  &:hover {
      background-color: $secondary-color;
      color: #fff;
    }
}
</style>