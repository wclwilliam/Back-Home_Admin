<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Pagination from '@/components/Pagination.vue'
import AdminHeader from '@/components/AdminHeader.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import { formatLastLogin } from '@/utils/formatTime'
import { adminAccountAPI } from '@/utils/adminApi'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 判斷當前用戶是否為一般管理員
const isGeneralAdmin = computed(() => userStore.user?.ADMIN_ROLE === 'general')

// 一般管理員只能看到自己的帳號，不能新增
const canAddAccount = computed(() => !isGeneralAdmin.value)

const handleAdd = () => {
  router.push({ name: 'admin-account-create' })
}

const handleEdit = (row) => {
  router.push({ name: 'admin-account-edit', params: { id: row.ADMIN_ID } })
}

const sortOptions = [
  // 帳號建立時間
  { label: '帳號最早建立', value: 'created_at_asc' },
  { label: '帳號最晚建立', value: 'created_at_desc' },

  // 最後登入時間
  { label: '最後登入最早', value: 'last_login_asc' },
  { label: '最後登入最晚', value: 'last_login_desc' },

  // 管理員姓名
  { label: '姓名筆畫 (少 → 多)', value: 'name_asc' },
  { label: '姓名筆畫 (多 → 少)', value: 'name_desc' },

  // 狀態
  { label: '啟用優先', value: 'status_enabled_first' },
  { label: '停用優先', value: 'status_disabled_first' },
]

// toolbar 狀態（接 TableToolbar）
const sortBy = ref('')
const keyword = ref('')

// 分頁狀態
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表格資料
const tableData = ref([])
const loading = ref(false)

// 排序和搜尋的回調
const handleSearch = async ({ sortBy: sb, searchQuery }) => {
  sortBy.value = sb ?? sortBy.value
  keyword.value = searchQuery ?? keyword.value
  currentPage.value = 1 // 搜尋時重置到第一頁
  await fetchAccountList()
}

// 調用 API 獲取帳號列表
const fetchAccountList = async () => {
  loading.value = true
  try {
    // 一般管理員只搜尋自己的帳號
    const searchKeyword = isGeneralAdmin.value ? userStore.user.ADMIN_ID : keyword.value

    const response = await adminAccountAPI.getList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword,
      sortBy: sortBy.value,
    })

    tableData.value = response.items || []
    total.value = response.pagination?.total || 0
  } catch (error) {
    ElMessage.error(error.message || '獲取帳號列表失敗，請稍後重試')
  } finally {
    loading.value = false
  }
}

// 頁面載入時獲取資料
onMounted(() => {
  fetchAccountList()
})

// 分頁變化時的回調（需要連接 Pagination 組件）
const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchAccountList()
}

// 角色對應表
const roleMap = {
  super: '超級管理員',
  general: '一般管理員',
}
</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="後台帳號管理" />

    <TableToolbar v-model:modelValueSort="sortBy" v-model:modelValueSearch="keyword" :sort-options="sortOptions"
      :add-disabled="!canAddAccount" search-placeholder="搜尋帳號 / 姓名" add-text="新增管理員" @search="handleSearch"
      @change="handleSearch" @add="handleAdd" />

    <el-table :data="tableData" style="width: 100%" class="customTable" v-loading="loading">
      <el-table-column prop="ADMIN_ID" label="管理員帳號" align="center" />

      <el-table-column prop="ADMIN_NAME" label="管理員姓名" align="center" />
      <el-table-column label="管理員角色" align="center">
        <template #default="{ row }">
          {{ roleMap[row.ADMIN_ROLE] || row.ADMIN_ROLE }}
        </template>
      </el-table-column>

      <el-table-column label="狀態" width="100" align="center">
        <template #default="{ row }">
          <span :class="{ disabled: row.ADMIN_ACTIVE == 0 }">
            {{ row.ADMIN_ACTIVE == 1 ? '啟用' : '停用' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="ADMIN_CREATED_AT" label="帳號建立時間" align="center">
        <template #default="{ row }">
          <div class="dateCell">{{ row.ADMIN_CREATED_AT }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="ADMIN_LAST_LOGIN_TIME" label="最後登入時間" align="center">
        <template #default="{ row }">
          <span>{{ formatLastLogin(row.ADMIN_LAST_LOGIN_TIME) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)"> 編輯 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination :total="total" :page-size="pageSize" :current-page="currentPage" @change="handlePageChange" />
  </div>
</template>

<style lang="scss" scoped>
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}

.customTable {
  :deep(th.el-table__cell) {
    background-color: $backstage-bar-color;
    font-size: 14px;
    color: $text-color;
    font-weight: bold;
    border-bottom: none;
  }
}

.dateCell {
  white-space: pre-line;
  font-size: 13px;
}

:deep(.disabled .el-select__selected-item) {
  color: #f56c6c;
}
</style>
