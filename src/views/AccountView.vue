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
  <Pagination />
</template>
<style lang="scss" scoped></style>
