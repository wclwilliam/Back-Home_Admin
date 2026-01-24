<script setup>
import { ref, computed } from 'vue'
import Pagination from '@/components/Pagination.vue'
import AdminHeader from '@/components/AdminHeader.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import { formatLastLogin } from '@/utils/formatTime'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleAdd = () => {
  router.push({ name: 'admin-account-create' })
}

const handleEdit = (row) => {
  router.push({ name: 'admin-account-edit', params: { id: row.id } })
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

// demo 資料（之後換 API）
const tableData = ref([
  {
    id: 'admin01',
    name: '王小明',
    role: '超級管理員',
    status: true, // true = 啟用, false = 停用
    createdAt: '2026-01-01\n10:30',
    lastLoginAt: '2026-01-20\n22:10',
  },
])

// 如果之後要做「前端搜尋」可以先用 computed；
// 若你是後端搜尋，就在 handleSearch 內打 API 更新 tableData 即可。
const filteredTableData = computed(() => {
  if (!keyword.value) return tableData.value
  const q = keyword.value.trim().toLowerCase()
  return tableData.value.filter((row) => {
    return String(row.id).toLowerCase().includes(q) || String(row.name).toLowerCase().includes(q)
  })
})

// 明確的「搜尋行為」：按 Enter / 點放大鏡才觸發（若你 TableToolbar 有 search emit）
const handleSearch = ({ sortBy: sb, searchQuery }) => {
  sortBy.value = sb ?? sortBy.value
  keyword.value = searchQuery ?? keyword.value
  // TODO: 這裡呼叫 API：fetchUsers({ sortBy: sortBy.value, keyword: keyword.value })
  console.log('搜尋', { sortBy: sortBy.value, keyword: keyword.value })
}
</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="後台帳號管理" />

    <TableToolbar
      v-model:modelValueSort="sortBy"
      v-model:modelValueSearch="keyword"
      :sort-options="sortOptions"
      search-placeholder="搜尋帳號 / 姓名"
      add-text="新增管理員"
      @search="handleSearch"
      @add="handleAdd"
    />

    <el-table :data="filteredTableData" style="width: 100%" class="customTable">
      <el-table-column prop="id" label="管理員帳號" align="center" />

      <el-table-column prop="name" label="管理員姓名" align="center" />
      <el-table-column prop="role" label="管理員角色" align="center" />

      <el-table-column label="狀態" width="100" align="center">
        <template #default="{ row }">
          <span :class="{ disabled: row.status === false }">
            {{ row.status ? '啟用' : '停用' }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="帳號建立時間" align="center">
        <template #default="{ row }">
          <div class="dateCell">{{ row.createdAt }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="lastLoginAt" label="最後登入時間" align="center">
        <template #default="{ row }">
          <span>{{ formatLastLogin(row.lastLoginAt) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)"> 編輯 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination />
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
