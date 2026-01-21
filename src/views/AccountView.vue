<script setup>
import Pagination from '@/components/Pagination.vue'
import AdminHeader from '@/layouts/AdminHeader.vue'
import TableToolbar from '@/components/TableToolbar.vue'

const adminName = '超級管理員'

const sortOptions = [
  { label: '最新建立', value: 'created_desc' },
  { label: '最早建立', value: 'created_asc' },
  { label: '最近登入', value: 'last_login_desc' },
  { label: '最久未登入', value: 'last_login_asc' },
  { label: '權限高 → 低', value: 'role_desc' },
  { label: '權限低 → 高', value: 'role_asc' },
]

const handleLogout = () => {
  console.log('登出處理')
}
</script>
<template>
  <AdminHeader title="後台帳號管理" :user-name="adminName" @logout="handleLogout" />
  <TableToolbar :sort-options="sortOptions" />
  <el-table
    :data="tableData"
    style="width: 100%"
    class="customTable"
    header-row-class-name="tableHeader"
  >
    <el-table-column prop="id" label="文章編號" width="100" align="center" />

    <el-table-column prop="category" label="分類" width="120" align="center" />

    <el-table-column label="封面圖" width="150" align="center">
      <template #default="scope">
        <el-image
          style="width: 100%; height: 60px; border-radius: 4px; display: block; margin: 0 auto"
          :src="scope.row.imageUrl"
          fit="cover"
        />
      </template>
    </el-table-column>

    <el-table-column prop="title" label="標題" min-width="150" align="center" />

    <el-table-column prop="date" label="發布時間" width="120" align="center">
      <template #default="scope">
        <div style="white-space: pre-line; font-size: 13px">{{ scope.row.date }}</div>
      </template>
    </el-table-column>

    <el-table-column prop="status" label="狀態" width="100" align="center" />

    <el-table-column label="操作" width="150" align="center" fixed="right">
      <template #default>
        <el-button link type="primary" size="small">編輯</el-button>
        <span style="color: #dcdfe6; margin: 0 8px">|</span>
        <el-button link type="danger" size="small">刪除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <Pagination />
</template>
<style lang="scss" scoped>
.customTable {
  :deep(th.el-table__cell) {
    background-color: $backstage-bar-color;
    font-size: 14px;
    color: $text-color;
    font-weight: bold;
    border-bottom: none;
  }
}
</style>
