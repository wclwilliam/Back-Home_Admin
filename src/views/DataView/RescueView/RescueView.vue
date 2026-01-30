<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { backHomeApi } from '@/utils/publicApi'
import AdminHeader from '@/components/AdminHeader.vue'
import Swal from 'sweetalert2'

const fileUrl = import.meta.env.VITE_FILE_URL

const router = useRouter()
const handleAdd = () => {
  router.push({ name: 'rescueAdd' })
}

const handleEdit = (row) => {
  router.push({ name: 'rescueEdit', params: { id: row.id } })
}

// 格式化海龜編號為 #1000X 格式
const formatRescueId = (id) => {
  return `#${String(10000 + Number(id))}`
}

// API 資料
const tableData = ref([])
const loading = ref(false)

// 分頁相關
const currentPage = ref(1) // 當前頁碼
const pageSize = 5 // 每頁顯示 5 筆

// 獲取救援案例資料
const fetchRescueData = async () => {
  loading.value = true
  try {
    const response = await backHomeApi.get('./savedcases/rescue_get.php')
    // 直接使用 API 返回的資料，不再進行欄位轉換
    tableData.value = response.data
  } catch (error) {
    console.error('Error fetching rescue data:', error)
    ElMessage.error('無法載入救援資料，請稍後再試')
  } finally {
    loading.value = false
  }
}

// 計算過濾後的資料（加上序號）
const filteredData = computed(() => {
  return tableData.value.map((item, index) => ({
    ...item,
    displayIndex: index + 1, // 全域序號
  }))
})

// 當前頁面顯示的資料
const displayData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredData.value.slice(start, end)
})

// 刪除救援案例
const handleDelete = async (row) => {
  const result = await Swal.fire({
    title: '確定要刪除嗎?',
    text: `刪除後將無法還原「${row.name}」的救援案例`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#E14720',
    cancelButtonColor: '#0E6273',
    confirmButtonText: '確定刪除',
    cancelButtonText: '取消',
  })

  if (result.isConfirmed) {
    try {
      // 執行刪除 API
      const response = await backHomeApi.delete(`./savedcases/rescue_delete.php?id=${row.id}`)

      if (response.data.success) {
        Swal.fire({
          title: '已刪除!',
          text: `「${row.name}」的救援案例已被移除`,
          icon: 'success',
          confirmButtonColor: '#0E6273',
        })

        // 重新獲取資料
        await fetchRescueData()

        // 如果當前頁沒有資料了，回到上一頁
        if (displayData.value.length === 0 && currentPage.value > 1) {
          currentPage.value--
        }
      } else {
        throw new Error(response.data.message || '刪除失敗')
      }
    } catch (error) {
      console.error('刪除失敗:', error)
      Swal.fire({
        title: '錯誤',
        text: error.response?.data?.message || '刪除失敗，請稍後再試',
        icon: 'error',
        confirmButtonColor: '#E14720',
      })
    }
  }
}

// 組件掛載時獲取資料
onMounted(() => {
  fetchRescueData()
})
</script>

<template>
  <div class="toolbarSection">
    <div class="filters">
      <!-- 佔位，保持排版一致 -->
    </div>

    <el-button plain class="addBtn" @click="handleAdd">新增資料</el-button>
  </div>

  <el-table :data="displayData" v-loading="loading" style="width: 100%" class="customTable">
    <el-table-column label="序號" width="60" align="center">
      <template #default="scope">
        {{ scope.row.displayIndex }}
      </template>
    </el-table-column>
    <el-table-column label="海龜編號" width="100" align="center">
      <template #default="scope">
        {{ formatRescueId(scope.row.id) }}
      </template>
    </el-table-column>
    <el-table-column prop="name" label="姓名" width="100" align="center" />
    <el-table-column prop="species" label="品種" width="100" align="center" />

    <el-table-column label="海龜照片" width="150" align="center">
      <template #default="scope">
        <el-image
          style="width: 100%; height: 60px; border-radius: 4px; display: block; margin: 0 auto"
          :src="
            scope.row.imageSrc
              ? fileUrl + scope.row.imageSrc
              : 'https://placehold.co/300x200?text=No+Image'
          "
          fit="cover"
        >
          <template #error>
            <div class="image-slot">
              <el-icon>
                <Picture />
              </el-icon>
            </div>
          </template>
        </el-image>
      </template>
    </el-table-column>

    <el-table-column prop="location" label="發現地點" width="100" align="center" />
    <el-table-column
      prop="description"
      label="受傷原因與故事文案"
      min-width="300"
      header-align="center"
    >
      <template #default="scope">
        <div class="story-cell">
          {{ scope.row.description }}
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="status" label="救治階段" width="120" align="center" />

    <el-table-column prop="uploadDate" label="上傳日期" width="180" align="center">
      <template #default="scope">
        {{ scope.row.uploadDate }}
      </template>
    </el-table-column>

    <el-table-column label="操作" width="150" align="center" fixed="right">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="handleEdit(scope.row)">編輯</el-button>
        <span style="color: #dcdfe6; margin: 0 8px">|</span>
        <el-button link type="danger" size="small" @click="handleDelete(scope.row)">刪除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <div class="paginationSection">
    <el-pagination
      background
      layout="prev, pager, next"
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="filteredData.length"
    />
  </div>
</template>

<style lang="scss" scoped>
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}

// 工具列
.toolbarSection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
}

.customTable {
  :deep(th.el-table__cell) {
    background-color: $card-color;
    font-size: 14px;
    color: $text-color;
    font-weight: bold;
    border-bottom: none;
  }
}

.story-cell {
  text-align: left;
  line-height: 1.5;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
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
