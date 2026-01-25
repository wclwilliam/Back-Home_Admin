<script setup>
import { computed, ref } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({
  activityId: { type: [String, Number], default: '' },
  activityTitle: { type: String, default: '' },
  // 接收父層整理好的 messages 陣列
  rawMessages: { type: Array, default: () => [] },
})

// 直接使用父層傳來的資料
const messages = computed(() => props.rawMessages)
const tableRef = ref(null)

// 計算平均評分
const averageRating = computed(() => {
  if (messages.value.length === 0) return 0
  const sum = messages.value.reduce((acc, curr) => acc + (curr.rating || 0), 0)
  return (sum / messages.value.length).toFixed(1)
})

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

//隱藏留言
const hideComment = (commentId) => {
  Swal.fire({
    icon: 'warning',
    title: '確定隱藏此留言嗎？',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then((result) => {
    if (result.isConfirmed) {
      // 調用後端 API 隱藏留言
      hideCommentApi(commentId)
    }
  })
}

//取消隱藏
const unhideComment = (commentId) => {
  Swal.fire({
    icon: 'warning',
    title: '確定取消隱藏此留言嗎？',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then((result) => {
    if (result.isConfirmed) {
      // 調用後端 API 取消隱藏留言
      unhideCommentApi(commentId)
    }
  })
}

//調用後端 API 隱藏留言
const hideCommentApi = (commentId) => {
  // TODO: 調用後端 API 隱藏留言
}

//調用後端 API 取消隱藏留言
const unhideCommentApi = (commentId) => {
  // TODO: 調用後端 API 取消隱藏留言
}
</script>

<template>
  <div class="tab-container">
    <div class="info-bar">
      <span class="label">活動評分</span>
      <span class="val">{{ averageRating }} / 5.0 (共 {{ messages.length }} 則評論)</span>
    </div>

    <el-table
      :data="messages"
      style="width: 100%"
      header-row-class-name="custom-header"
      row-class-name="custom-row"
      ref="tableRef"
    >
      <el-table-column type="expand" class="hide-expand-icon" width="1">
        <template #default="props">
          <div class="report-detail-container">
            <div class="report-header">
              <span style="font-weight: bold">檢舉紀錄</span>
              <span style="float: right">目前累積檢舉：{{ props.row.reportCount }} 次</span>
            </div>

            <div v-if="props.row.reports.length > 0" class="report-list">
              <div v-for="(rep, idx) in props.row.reports" :key="idx" class="report-row">
                <div class="r-col r-id">
                  <strong>{{ idx + 1 }}</strong>
                </div>
                <div class="r-col">檢舉會員：{{ rep.reporter }}</div>
                <div class="r-col">檢舉理由：{{ rep.reason }}</div>
                <div class="r-col">檢舉時間：{{ rep.time }}</div>
                <div class="r-col">
                  <el-select v-model="rep.status" size="small" style="width: 110px">
                    <el-option label="待處理" value="待處理" />
                    <el-option label="已處理" value="已處理" />
                  </el-select>
                </div>
              </div>
            </div>
            <div v-else style="color: #999; text-align: center; padding: 10px">無檢舉紀錄</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="編號" width="80" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="會員編號" prop="memberId" width="100" align="center" />
      <el-table-column label="評分" prop="rating" width="80" align="center" />

      <el-table-column label="心得內容" min-width="300">
        <template #default="scope">
          <div style="line-height: 1.5">{{ scope.row.content }}</div>
        </template>
      </el-table-column>

      <el-table-column label="按讚數" prop="likeCount" width="80" align="center" />

      <el-table-column label="檢舉紀錄" width="120" align="center">
        <template #default="scope">
          <span
            v-if="scope.row.reportCount > 0"
            style="color: #e65d4f; font-weight: bold"
            @click="toggleExpand(scope.row)"
          >
            {{ scope.row.reportCount }} 則檢舉
          </span>
          <span v-else>無</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <button
            class="hide-btn"
            @click="scope.row.isVisible ? hideComment(scope.row.id) : unhideComment(scope.row.id)"
          >
            {{ scope.row.isVisible ? '隱藏留言' : '取消隱藏' }}
          </button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background layout="prev, pager, next" :total="messages.length" class="mt-4" />
    </div>
  </div>
</template>

<style scoped lang="scss">
$disable-col: #dcdcdc;
$highlight-color1: #4fa8c3;
$input-line-color2: #0e6273;
$table-header: #7baab0;
$btn-bg: #cccccc;
$text-color: #333333;
$box-shadow: #aaaaaa;
$highlight-color2: #e14720;
$title-col: #153450;
.tab-container {
  padding: 20px 0;
}

.info-bar {
  margin-bottom: 20px;
  font-size: 16px;
}
.label {
  font-weight: bold;
  color: $title-col;
  margin-right: 5px;
}
.val {
  color: $text-color;
}

:deep(.custom-header th) {
  background-color: $card-color !important;
  color: #102a43;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid $btn-bg;
}

:deep(.el-table__expand-column .el-table__expand-icon) {
  display: none;
}
/* 檢舉展開區塊 (米色) */
:deep(.el-table__expanded-cell) {
  background-color: $disable-col !important;
  padding: 0 !important;
}
.report-detail-container {
  padding: 20px 40px;
}
.report-header {
  margin-bottom: 15px;
  border-bottom: 1px solid $btn-bg;
  padding-bottom: 10px;
}

.report-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed $btn-bg;
}
.report-row:last-child {
  border-bottom: none;
}

.r-col {
  font-size: 14px;
  color: $text-color;
}
.r-id {
  width: 30px;
}

/* 分頁 (共用樣式) */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
