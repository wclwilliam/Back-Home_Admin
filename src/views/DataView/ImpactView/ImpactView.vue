<script setup>
import { ref, computed,onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Pagination from '@/components/Pagination.vue'
import { backHomeApi } from '@/utils/publicApi'
import Swal from 'sweetalert2'

const router = useRouter()
const handleAdd = () => {
  router.push({ name: 'impactAdd' })
}

// --- 響應式狀態 ---
const rawData = ref([])
const sortBy = ref('newest')
const currentPage = ref(1) // 當前頁碼
const pageSize = ref(10)   // 每頁筆數

// const rawData = [
//   { id: '01', year: '2021', date: '2021/01/01 13:50:30' },
//   { id: '02', year: '2022', date: '2022/01/02 12:55:30' },
//   { id: '03', year: '2023', date: '2023/01/01 18:08:21' },
//   { id: '04', year: '2024', date: '2024/01/03 12:12:12' },
//   { id: '05', year: '2025', date: '2025/01/02 17:55:30' },
// ]
const fetchImpactData = async () => {
  try {
    const res = await backHomeApi.get("donation/impact_get.php")
    // 確保 res.data 是陣列，直接賦值給 rawData.value
    rawData.value = res.data 
    // console.log(rawData.value);
    
  } catch (error) {
    console.error("獲取資料失敗:", error)
  }
}

onMounted(() => {
  fetchImpactData();
})

// 1. 處理「排序」後的完整數據
const sortedData = computed(() => {
  let result = [...rawData.value]
  result.sort((a, b) => {
    const timeA = new Date(a.year).getTime()
    const timeB = new Date(b.year).getTime()
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


//刪除資料邏輯
const deleteData = async (d)=>{
  const result = await Swal.fire({
    title: '確定要刪除嗎?',
    text: "刪除後將無法還原此文章",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#E14720',
    cancelButtonColor: '#0E6273',
    confirmButtonText: '確定刪除',
    cancelButtonText: '取消'
  })
  if (result.isConfirmed) {
    try {
      const response = await backHomeApi.delete('donation/impact_delete.php',{
        data: {
            id: d.id
        }
      })

      if (response.data.status) {
        Swal.fire({
          title: '已刪除!',
          text: `資料已成功刪除`,
          icon: 'success',
          confirmButtonColor: '#0E6273',
        })
        fetchImpactData();  //刷新
      }
    } catch(error) {
      console.error('刪除失敗:', error)
      Swal.fire({
        title: '錯誤',
        text: '刪除失敗,請稍後再試',
        icon: 'error',
        confirmButtonColor: '#E14720'
      })
    }
    
  }
  
}
const handleEdit = (row) => {
  router.push({ name: 'impactEdit', params: { id: row.id } })
}
</script>

<template>
  <div class="toolbarSection">
    <div class="filters">
      <el-select v-model="sortBy" placeholder="排序" style="width: 180px; margin-right: 12px;">
        <el-option label="資料年份（新 → 舊）" value="newest" />
        <el-option label="資料年份（舊 → 新）" value="oldest" />
      </el-select>
    </div>
    <el-button plain class="addBtn" @click="handleAdd">新增資料</el-button>
  </div>

  <el-table :data="displayData" style="width: 100%" class="customTable">
    <el-table-column prop="id" label="資料編號" width="100" align="center" />
    <el-table-column prop="year" label="資料年份" width="120" align="center" />
    <el-table-column prop="upload_date" label="上傳日期" min-width="180" align="center" />

    <el-table-column label="操作" width="150" align="center">
      <template #default="scope">
        <div class="operation-cell">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">編輯</el-button>
          <span style="color: #dcdfe6; margin: 0 8px">|</span>
          <el-button link type="danger" size="small" @click="deleteData(scope.row)">刪除</el-button>
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


.addBtn {
  border-color: $secondary-color;
  color: $secondary-color;
  &:hover {
      background-color: $secondary-color;
      color: #fff;
    }
}
</style>