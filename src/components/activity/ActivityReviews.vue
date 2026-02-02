<script setup>
import { computed, ref } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'
import Swal from 'sweetalert2'
import { backHomeApi } from '@/utils/publicApi'
import { ElMessage } from 'element-plus'

const props = defineProps({
  activityId: { type: [String, Number], default: '' },
  activityTitle: { type: String, default: '' },
  // 接收父層整理好的 messages 陣列
  rawMessages: { type: Array, default: () => [] },
})
const emit = defineEmits(['refresh'])

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
const expandedRows = ref([])
const toggleExpand = (row) => {
  tableRef.value.toggleRowExpansion(row)
  const index = expandedRows.value.indexOf(row.id)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(row.id)
  }
}

const toggleReviewVisibility = async (review) => {
  const newStatus = review.isVisible ? 0 : 1 // 切換狀態
  if (newStatus === 0) {
    // 隱藏留言
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '確定要隱藏此留言嗎？',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    })
    if (!confirm.isConfirmed) return
  } else {
    // 取消隱藏
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '確定要取消隱藏此留言嗎？',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    })
    if (!confirm.isConfirmed) return
  }

  try {
    const response = await backHomeApi.post('/activity/admin_activity_review_action.php', {
      action: 'toggle_review',
      review_id: review.id,
      is_visible: newStatus,
    })

    if (response.data.status === 'success') {
      ElMessage.success(response.data.message)
      // 更新畫面資料
      review.isVisible = newStatus === 1
    }
  } catch (error) {
    ElMessage.error('操作失敗')
  }
}

const handleReport = async (reportId, status) => {
  try {
    const response = await backHomeApi.post('/activity/admin_activity_review_action.php', {
      action: 'update_report',
      report_id: reportId,
      status: status, // '已處理' 或 '已駁回'
    })

    if (response.data.status === 'success') {
      ElMessage.success('檢舉狀態已更新')
      // 重新整理評論資料
      emit('refresh')
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失敗')
  }
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
                  <el-select
                    v-model="rep.status"
                    size="small"
                    style="width: 110px"
                    @change="(val) => handleReport(rep.id, rep.status)"
                  >
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
          <el-button
            type="danger"
            link
            v-if="scope.row.reportCount > 0"
            style="color: #e65d4f; font-weight: bold"
            @click="toggleExpand(scope.row)"
          >
            {{ scope.row.reportCount }} 則檢舉
            <el-icon v-if="scope.row.reportCount > 0"><CaretTop /></el-icon>
            <el-icon v-else><CaretBottom /></el-icon>
          </el-button>
          <span v-else>無</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <button
            class="hide-btn"
            @click="
              scope.row.isVisible
                ? toggleReviewVisibility(scope.row)
                : toggleReviewVisibility(scope.row)
            "
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
