<script setup>
import { ref } from 'vue'

// 搜尋與篩選
const sortBy = ref('')

// 模擬資料
const tableData = [
    { id: '01', year: '2021', date: '2021/01/01 13:50:30' },
    { id: '02', year: '2022', date: '2022/01/02 12:55:30' },
    { id: '03', year: '2023', date: '2023/01/01 18:08:21' },
    { id: '04', year: '2024', date: '2024/01/03 12:12:12' },
    { id: '05', year: '2025', date: '2025/01/02 17:55:30' },

]
</script>

<template>
    <div class="toolbarSection">
            <div class="filters">
                <el-select v-model="sortBy" placeholder="排序" style="width: 120px; margin-right: 12px;">
                    <el-option label="最新" value="newest" />
                    <el-option label="最早" value="oldest" />
                </el-select>
            </div>

            <el-button plain class="addBtn">新增資料</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" class="customTable">
            <el-table-column prop="id" label="資料編號" width="100" align="center" />
            <el-table-column prop="year" label="資料年份" width="120" align="center" />
            <el-table-column prop="date" label="上傳日期" min-width="180" align="center" />

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

        <div class="paginationSection">
            <el-pagination background layout="prev, pager, next" :total="50" />
        </div>
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
    background-color: $backstage-bar-color ; 
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