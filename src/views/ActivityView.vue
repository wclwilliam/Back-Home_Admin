<template>
  <el-card>
    <el-table 
      :data="tableData" 
      border 
      stripe 
      v-loading="loading" 
      style="width: 100%"
    >
      <el-table-column prop="date" label="建立日期" width="180" sortable />
      <el-table-column prop="name" label="用戶名稱" width="180" />

      <el-table-column label="狀態" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'Active' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">
            編輯
          </el-button>
          
          <el-popconfirm title="確定要刪除嗎？" @confirm="handleDelete(scope.row)">
            <template #reference>
              <el-button size="small" type="danger">刪除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="100"
      />
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const tableData = ref([
  { date: '2024-01-01', name: 'User A', status: 'Active' },
  { date: '2024-01-02', name: 'User B', status: 'Inactive' },
])

const handleEdit = (row) => {
  console.log('Edit', row)
}
const handleDelete = (row) => {
  console.log('Delete', row)
}
</script>