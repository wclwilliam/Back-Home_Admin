<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'
import Swal from 'sweetalert2'
import { backHomeApi } from '@/utils/publicApi'
import Pagination from '@/components/Pagination.vue'

const router = useRouter()
const fileUrl = import.meta.env.VITE_FILE_URL


const handleAdd = () => {
  router.push({ name: 'news-add' })
}

const listEdit = (row) => {
  router.push({ name: 'news-edit', params: { id: row.id } })
}

const sortBy = ref('')
const searchQuery = ref('')
const statusFilter = ref('全部')
const loading = ref(false)
const tableDataOriginal = ref([]) // 從 API 獲取的原始資料


// 從 API 獲取資料
const fetchNewsData = async () => {
  loading.value = true
  try {
    const response = await backHomeApi.get('./news/news_get.php?mode=admin')
    //const response = await backHomeApi.get(`./news/news_get.php?mode=admin&t=${Date.now()}`)

    // 轉換資料格式以符合前端顯示需求
    tableDataOriginal.value = response.data.map(item => ({
      id: String(item.id).padStart(2, '0'), // 格式化為兩位數字串
      category: item.category,
      imageUrl: item.image_path ? (fileUrl + item.image_path) : 'https://placehold.co/300x200?text=No+Image',
      title: item.title,
      date: formatDateTime(item.published_at), // 格式化日期時間
      status: item.status === 'published' ? '已發布' : '草稿',
      rawStatus: item.status, // 保留原始狀態用於後續操作
      author_id: item.author_id,
      content: item.content
    }))

  } catch (error) {
    console.error('獲取新聞資料失敗:', error)
    Swal.fire({
      title: '錯誤',
      text: '無法載入新聞資料,請稍後再試',
      icon: 'error',
      confirmButtonColor: '#E14720'
    })
  } finally {
    loading.value = false
  }
}

// 格式化日期時間
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''

  const date = new Date(dateTimeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}\n${hours}:${minutes}:${seconds}`
}

// 刪除文章
const listDelete = async (row) => {
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
      // 執行刪除 API 
      await backHomeApi.delete(`./news/news_delete.php?id=${row.id}`)

      Swal.fire({
        title: '已刪除!',
        text: '該內容已被移除。',
        icon: 'success',
        confirmButtonColor: '#0E6273'
      })

      // 重新獲取資料
      fetchNewsData()

    } catch (error) {
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

// 計算屬性：篩選+排序後的完整資料（不含分頁）
const filteredData = computed(() => {
  let result = [...tableDataOriginal.value]

  // 1. 狀態篩選
  if (statusFilter.value !== '全部') {
    result = result.filter(item => item.status === statusFilter.value)
  }

  // 2. 搜尋篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    )
  }

  // 3. 排序
  if (sortBy.value === 'newest') {
    // 由近到遠
    result.sort((a, b) => {
      const dateA = new Date(a.date.replace('\n', ' '))
      const dateB = new Date(b.date.replace('\n', ' '))
      return dateB - dateA
    })
  } else if (sortBy.value === 'oldest') {
    // 由遠到近
    result.sort((a, b) => {
      const dateA = new Date(a.date.replace('\n', ' '))
      const dateB = new Date(b.date.replace('\n', ' '))
      return dateA - dateB
    })
  }

  return result
})

// 分頁後切換邏輯
const currentPage = ref(1) // 當前頁碼
const pageNumber = computed(() => {
  const start = (currentPage.value - 1) * 10
  const end = start + 10
  return filteredData.value.slice(start, end)
})

// 監聽篩選條件變化，自動回到第一頁
watch([statusFilter, searchQuery, sortBy], () => {
  currentPage.value = 1
})

// 組件載入時獲取資料
onMounted(() => {
  fetchNewsData()
})



</script>


<template>
  <div class="pageContainer">
    <AdminHeader title="最新消息管理" />

    <div class="toolbarSection">
      <div class="filters">
        <!-- 狀態篩選器 -->
        <el-select v-model="statusFilter" placeholder="狀態" style="width: 120px; margin-right: 12px;">
          <el-option label="全部" value="全部" />
          <el-option label="已發布" value="已發布" />
          <el-option label="草稿" value="草稿" />
        </el-select>

        <!-- 排序篩選器 -->
        <el-select v-model="sortBy" placeholder="排序" style="width: 120px; margin-right: 12px;">
          <el-option label="由近到遠" value="newest" />
          <el-option label="由遠到近" value="oldest" />
        </el-select>

        <!-- 搜尋篩選器 -->
        <el-input v-model="searchQuery" placeholder="搜尋" style="width: 200px">
          <template #suffix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <el-button plain class="addBtn" @click="handleAdd">新增資料</el-button>
    </div>

    <!-- 添加載入狀態 -->
    <el-table :data="pageNumber" style="width: 100%" class="customTable" header-row-class-name="tableHeader"
      v-loading="loading" element-loading-text="載入中...">

      <el-table-column label="序號" width="100" align="center">
        <template #default="scope">
          {{ String(scope.$index + 1 + (currentPage - 1) * 10).padStart(2, '0') }}
        </template>
      </el-table-column>

      <el-table-column prop="category" label="分類" width="120" align="center" />

      <el-table-column label="封面圖" width="150" align="center">
        <template #default="scope">
          <el-image style="width: 100%; height: 60px; border-radius: 4px; display: block; margin: 0 auto;"
            :src="scope.row.imageUrl" fit="cover">
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

      <el-table-column prop="title" label="標題" min-width="150" align="center" />

      <el-table-column prop="date" label="發布時間" width="120" align="center">
        <template #default="scope">
          <div style="white-space: pre-line; font-size: 13px;">{{ scope.row.date }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="狀態" width="100" align="center" />

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="listEdit(scope.row)">編輯</el-button>
          <span style="color: #dcdfe6; margin: 0 8px">|</span>
          <el-button link type="danger" size="small" @click="listDelete(scope.row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="paginationSection">
      <Pagination v-model:current-page="currentPage" :total="filteredData.length" />
    </div>
  </div>
</template>


<style scoped lang="scss">
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}

.headerSection {
  border-bottom: 2px solid $primary-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;

  .pageTitle {
    font-size: 36px;
    color: $primary-color;
    font-weight: bold;
    margin: 0;
  }

  .userInfo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: $text-color;
  }
}

.logoutBtn {
  border: 1px solid $secondary-color;
  color: $secondary-color;
}

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