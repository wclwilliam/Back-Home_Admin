<template>
  <div class="tab-container">
    <div class="info-bar">
      <div class="info-content">
        <span class="label">活動編號</span> <span class="val">{{ activityId }}</span>
        <span class="label">活動名稱</span> <span class="val">{{ activityTitle }}</span>
        <span class="label">報名狀態</span> <span class="val">20/40</span>
      </div>
      <el-button class="export-btn">匯出名單 (Excel)</el-button>
    </div>

    <el-table
      ref="tableRef"
      :data="memberList"
      style="width: 100%"
      header-row-class-name="custom-header"
      row-class-name="custom-row"
      @row-click="handleRowClick"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="expand-detail">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <span class="d-label">真實姓名：</span>{{ props.row.realName }}
                </div>
                <div class="detail-item">
                  <span class="d-label">性別：</span>{{ props.row.gender }}
                </div>
                <div class="detail-item">
                  <span class="d-label">出生日期：</span>{{ props.row.dob }}
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <span class="d-label">身分證號：</span>{{ props.row.idNumber }}
                </div>
                <div class="detail-item">
                  <span class="d-label">緊急聯絡人姓名：</span>{{ props.row.emergencyContact }}
                </div>
                <div class="detail-item">
                  <span class="d-label">緊急聯絡人電話：</span>{{ props.row.emergencyPhone }}
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="報名編號" prop="id" width="80" align="center" />
      <el-table-column label="會員編號" prop="memberId" width="100" align="center" />
      <el-table-column label="會員姓名" prop="name" width="120" />
      <el-table-column label="Email" prop="email" min-width="180" />
      <el-table-column label="行動電話" prop="phone" width="120" />

      <el-table-column label="出席狀態" width="100" align="center">
        <template #default="scope">
          <div class="checkbox-mock" :class="{ checked: scope.row.attended }">
            <el-icon v-if="scope.row.attended"><Check /></el-icon>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="報名時間" width="150" align="center">
        <template #default="scope">
          <div style="white-space: pre-line; line-height: 1.2">{{ scope.row.signupTime }}</div>
        </template>
      </el-table-column>

      <el-table-column label="是否取消" prop="isCancelled" width="100" align="center" />

      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <span class="action-text" @click.stop="toggleExpand(scope.row)">
            {{ expandedRows.includes(scope.row.id) ? '收合' : '收合' }}
            <el-icon v-if="expandedRows.includes(scope.row.id)"><CaretTop /></el-icon>
            <el-icon v-else><CaretBottom /></el-icon>
          </span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination layout="prev, pager, next" :total="50" class="custom-pagination" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Check, CaretBottom, CaretTop } from '@element-plus/icons-vue'

// 接收父層傳來的基本資訊
defineProps({
  activityId: { type: String, default: '01' },
  activityTitle: { type: String, default: '海洋公民科學家工作坊' },
})

const tableRef = ref(null)
const expandedRows = ref([]) // 紀錄目前展開的行 ID

// 模擬假資料 (因為 JSON 沒有這部分的詳細名單)
const memberList = ref([
  {
    id: '01',
    memberId: '01',
    name: '王曉明',
    email: '123dfr@gmail.com',
    phone: '0912345678',
    attended: true,
    signupTime: '2025-04-09\n16:30:20',
    isCancelled: '否',
    realName: '王曉明',
    gender: '生理男',
    dob: '1995-08-20',
    idNumber: 'A123456789',
    emergencyContact: '王大明',
    emergencyPhone: '0912345678',
  },
  {
    id: '02',
    memberId: '01',
    name: '王曉明',
    email: '123dfr@gmail.com',
    phone: '0912345678',
    attended: true,
    signupTime: '2025-04-09\n16:30:20',
    isCancelled: '否',
    realName: '王曉明',
    gender: '生理男',
    dob: '1995-08-20',
    idNumber: 'A123456789',
    emergencyContact: '王大明',
    emergencyPhone: '0912345678',
  },
  // ... 可以複製更多
])

// 控制展開邏輯
const toggleExpand = (row) => {
  tableRef.value.toggleRowExpansion(row)
  const index = expandedRows.value.indexOf(row.id)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(row.id)
  }
}

// 點擊整行也可以展開
const handleRowClick = (row) => {
  toggleExpand(row)
}
</script>

<style scoped>
.tab-container {
  padding: 20px 40px;
}

/* 頂部資訊列 */
.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f5f7fa;
}
.info-content {
  display: flex;
  align-items: center;
  gap: 20px;
}
.label {
  font-weight: bold;
  color: #102a43;
}
.val {
  color: #333;
}
.export-btn {
  border: 2px solid #2c6e88;
  color: #2c6e88;
  font-weight: bold;
  background: transparent;
  border-radius: 0;
  padding: 15px 20px;
}

/* 表格樣式 */
:deep(.custom-header th) {
  background-color: #dbe4e8 !important;
  color: #102a43;
  font-weight: bold;
  border-bottom: 1px solid #aebac3;
}
:deep(.el-table__row) {
  cursor: pointer;
}

/* 模擬 Checkbox */
.checkbox-mock {
  width: 18px;
  height: 18px;
  border: 1px solid #2c6e88;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkbox-mock.checked {
  color: #2c6e88;
  font-weight: bold;
}

/* 展開區域樣式 (米色背景) */
:deep(.el-table__expanded-cell) {
  background-color: #f4f3ea !important; /* 圖片中的米色 */
  padding: 20px 50px !important;
}
.expand-detail {
  padding: 10px;
}
.detail-item {
  margin-bottom: 15px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
  display: flex;
}
.d-label {
  font-weight: bold;
  min-width: 120px;
  color: #000;
}

.action-text {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

/* 分頁 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
:deep(.el-pagination .el-pager li) {
  background: transparent;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
  margin: 0 5px;
}
:deep(.el-pagination .el-pager li.is-active) {
  color: #333;
  border-bottom-color: #333;
  font-weight: bold;
}
</style>
