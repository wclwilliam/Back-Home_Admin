<script setup>
import { computed } from 'vue'

const props = defineProps({
  activityId: { type: String, default: '01' },
  activityTitle: { type: String, default: '' },
  // 接收 JSON 中的 messages 陣列
  rawMessages: { type: Array, default: () => [] },
})

const messages = computed(() => {
  return props.rawMessages.map((msg, index) => {
    // 假裝第二則留言有被檢舉
    const hasReport = index === 1
    return {
      ...msg,
      reportCount: hasReport ? 2 : 0,
      reports: hasReport
        ? [
            {
              reporter: '02',
              reason: '商業廣告或垃圾訊息',
              time: '2025-04-09-16:30:20',
              status: 'pending',
            },
            {
              reporter: '03',
              reason: '商業廣告或垃圾訊息',
              time: '2025-04-09-16:30:20',
              status: 'done',
            },
          ]
        : [],
    }
  })
})
</script>

<template>
  <div class="tab-container">
    <div class="info-bar">
      <span class="label">活動編號</span>
      <span class="val" style="margin-right: 20px">{{ activityId }}</span>
      <span class="label">活動名稱</span>
      <span class="val" style="margin-right: 20px">{{ activityTitle }}</span>
      <span class="label">活動評分</span> <span class="val">4.8</span>
    </div>
    <el-table
      :data="messages"
      style="width: 100%"
      header-row-class-name="custom-header"
      row-class-name="custom-row"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="report-detail-container">
            <div class="report-header">
              <span style="font-weight: bold">檢舉紀錄</span>
              <span style="float: right">目前累積檢舉：{{ props.row.reportCount }} 次</span>
            </div>
            <div class="report-list">
              <div v-for="(rep, idx) in props.row.reports" :key="idx" class="report-row">
                <div class="r-col r-id">
                  <strong>{{ idx + 1 }}</strong>
                </div>
                <div class="r-col">檢舉會員：{{ rep.reporter }}</div>
                <div class="r-col">檢舉理由：{{ rep.reason }}</div>
                <div class="r-col">檢舉時間：{{ rep.time }}</div>
                <div class="r-col">
                  <el-select v-model="rep.status" size="large" style="width: 100px">
                    <el-option label="待處理" value="pending" />
                    <el-option label="處理完畢" value="done" />
                  </el-select>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="編號" type="index" width="60" align="center" />
      <el-table-column label="會員編號" width="100" align="center">
        <template #default>01</template>
      </el-table-column>
      <el-table-column label="評分" prop="rating" width="80" align="center" />

      <el-table-column label="心得內容" min-width="300">
        <template #default="scope">
          <div style="line-height: 1.5">{{ scope.row.content }}</div>
        </template>
      </el-table-column>

      <el-table-column label="按讚數" width="80" align="center">
        <template #default>20</template>
      </el-table-column>

      <el-table-column label="檢舉紀錄" width="120" align="center">
        <template #default="scope">
          <span v-if="scope.row.reportCount > 0">{{ scope.row.reportCount }} 則檢舉</span>
          <span v-else>無</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" align="center">
        <template #default>
          <el-link class="hide-link" underline="always">隱藏留言</el-link>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        layout="prev, pager, next"
        :total="messages.length"
        class="custom-pagination"
      />
    </div>
  </div>
</template>

<style scoped>
.tab-container {
  padding: 20px 40px;
}

.info-bar {
  margin-bottom: 20px;
  font-size: 16px;
}
.label {
  font-weight: bold;
  color: #102a43;
  margin-right: 5px;
}
.val {
  color: #333;
}

:deep(.custom-header th) {
  background-color: #dbe4e8 !important;
  color: #102a43;
  font-weight: bold;
  border-bottom: 1px solid #aebac3;
}

.hide-link {
  color: #333;
  font-weight: bold;
  border-bottom: 1px solid #333;
}

/* 檢舉展開區塊 (米色) */
:deep(.el-table__expanded-cell) {
  background-color: #f4f3ea !important;
  padding: 0 !important;
}
.report-detail-container {
  padding: 20px 40px;
}
.report-header {
  margin-bottom: 15px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.report-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px 0;
}
.r-col {
  font-size: 14px;
  color: #333;
}
.r-id {
  width: 30px;
}

/* 分頁 (共用樣式) */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
:deep(.el-pagination .el-pager li) {
  background: transparent;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
}
:deep(.el-pagination .el-pager li.is-active) {
  color: #333;
  border-bottom-color: #333;
  font-weight: bold;
}
</style>
