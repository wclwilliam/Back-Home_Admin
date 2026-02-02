<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { Check, CaretBottom, CaretTop, View, Hide } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Swal from 'sweetalert2'
import { backHomeApi } from '@/utils/publicApi'

// 接收父層傳來的基本資訊
const props = defineProps({
  activityId: { type: [String, Number], default: '' },
  activityTitle: { type: String, default: '' },
  activityStatus: { type: String, default: '' },
  maxPeople: { type: [Number, String], default: 0 },
})

const tableRef = ref(null)
const expandedRows = ref([]) // 紀錄目前展開的活動 ID
const isEditingAttendance = ref(false) // 控制是否處於編輯出席狀態模式
const memberList = ref([])

// 身分證遮罩處理
const visibleIdMap = reactive({})
const toggleIdVisibility = (id) => {
  visibleIdMap[id] = !visibleIdMap[id]
}
const maskIdNumber = (val) => {
  if (!val || val.length < 5) return '*****'
  return val.substring(0, 3) + '*****' + val.substring(val.length - 2)
}

const initData = async () => {
  const targetId = parseInt(props.activityId)
  if (!targetId) {
    memberList.value = []
    return
  }
  const url = `/activity/admin_activity_signup_list_get.php?activity_id=${targetId}`
  try {
    const response = await backHomeApi.get(url)
    if (response.data.status === 'success') {
      const rawData = response.data.data

      memberList.value = rawData.map((item) => {
        // 資料庫: 1=取消, 0=正常
        const isCancelled = item.CANCEL == 1
        // 資料庫: 1=出席, 0=未出席
        const isAttended = item.ATTENDED == 1
        return {
          id: item.ACTIVITY_SIGNUP_ID,
          memberId: item.USER_ID,
          name: item.REAL_NAME,
          email: item.EMAIL,
          phone: item.PHONE,
          attended: isCancelled ? false : isAttended,
          signupTime: item.CREATED_AT ? item.CREATED_AT.replace(' ', '\n') : '',
          isCancelled: isCancelled ? '是' : '否',
          birthday: item.BIRTHDAY,
          idNumber: item.ID_NUMBER,
          emergencyContact: item.EMERGENCY,
          emergencyPhone: item.EMERGENCY_TEL,
        }
      })
    } else {
      console.log('取得活動報名列表失敗', response.data.message)
      ElMessage.error('取得活動報名列表失敗')
      memberList.value = []
    }
  } catch (error) {
    console.error('取得活動報名列表失敗', error)
    ElMessage.error('取得活動報名列表失敗')
    memberList.value = []
  }
}
//取得取消人數
const cancelledNum = computed(
  () => memberList.value.filter((item) => item.isCancelled === '是').length,
)
watch(() => props.activityId, initData, { immediate: true })

const handleEditAttendance = () => {
  if (isEditingAttendance.value) {
    // 目前是編輯模式 -> 執行儲存
    Swal.fire({
      title: '確定要儲存出席狀態嗎？',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    }).then((result) => {
      if (result.isConfirmed) {
        isEditingAttendance.value = false
        ElMessage.success('出席狀態已更新')
        // TODO: 這裡未來可呼叫 API 將 memberList.value 的變更回寫後端
      }
    })
  } else {
    // 目前是檢視模式 -> 欲切換為編輯模式
    // 檢查活動是否已結束
    if (props.activityStatus !== '已結束') {
      ElMessage.warning('活動尚未結束，無法修改出席狀態')
      return
    }

    // 通過檢查，開啟編輯模式
    isEditingAttendance.value = true
    ElMessage.info('已開啟編輯模式，請直接點擊列表中的方框')
  }
}

const toggleAttendanceStatus = (row) => {
  // 只有在編輯模式下才能點擊
  if (!isEditingAttendance.value) return

  // 若該會員已取消報名，則無法設為出席
  if (row.isCancelled === '是') return

  row.attended = !row.attended
}
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
</script>
<template>
  <div class="tab-container">
    <div class="info-bar">
      <div class="info-content">
        <span class="label">目前報名狀態</span>
        <span class="val">最大報名人數:</span>
        <span class="label">{{ maxPeople }}</span>
        <span class="val">報名:</span>
        <span class="label">{{ memberList.length }}</span>
        <span class="val">出席:</span>
        <span class="label">{{ memberList.length - cancelledNum }}</span>
        <span class="val">取消:</span>
        <span class="label">{{ cancelledNum }}</span>
      </div>
      <div class="btn_group">
        <el-button
          class="export-btn"
          :class="{ 'is-editing': isEditingAttendance }"
          @click="handleEditAttendance"
        >
          {{ isEditingAttendance ? '儲存出席狀態' : '修改出席狀態' }}
        </el-button>

        <el-button class="export-btn">匯出名單 (Excel)</el-button>
      </div>
    </div>

    <el-table
      ref="tableRef"
      :data="memberList"
      style="width: 100%"
      header-row-class-name="custom-header"
      row-class-name="custom-row"
    >
      <el-table-column type="expand" width="1" class="hide-expand-icon">
        <template #default="props">
          <div class="expand-detail">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <span class="d-label">出生日期：</span>{{ props.row.birthday }}
                </div>
                <div class="detail-item">
                  <span class="d-label">緊急聯絡人姓名：</span>{{ props.row.emergencyContact }}
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <span class="d-label">身分證號：</span>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span>
                      {{
                        visibleIdMap[props.row.id]
                          ? props.row.idNumber
                          : maskIdNumber(props.row.idNumber)
                      }}
                    </span>
                    <el-icon class="eye-icon" @click="toggleIdVisibility(props.row.id)">
                      <View v-if="visibleIdMap[props.row.id]" />
                      <Hide v-else />
                    </el-icon>
                  </div>
                </div>
                <div class="detail-item">
                  <span class="d-label">緊急聯絡人電話：</span>{{ props.row.emergencyPhone }}
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="報名編號" width="80" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="會員編號" prop="memberId" width="100" align="center" />
      <el-table-column label="會員姓名" prop="name" width="120" />
      <el-table-column label="Email" prop="email" min-width="180" />
      <el-table-column label="行動電話" prop="phone" width="120" />

      <el-table-column label="出席狀態" width="120" align="center" prop="attended" sortable>
        <template #default="scope">
          <div
            class="checkbox-mock"
            :class="{
              checked: scope.row.attended,
              editable: isEditingAttendance && scope.row.isCancelled !== '是',
              disabled: scope.row.isCancelled === '是',
            }"
            @click="toggleAttendanceStatus(scope.row)"
          >
            <el-icon v-if="scope.row.attended"><Check /></el-icon>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="報名時間" width="150" align="center">
        <template #default="scope">
          <div style="white-space: pre-line; line-height: 1.4">{{ scope.row.signupTime }}</div>
        </template>
      </el-table-column>

      <el-table-column label="是否取消" prop="isCancelled" width="100" align="center">
        <template #default="scope">
          <span :style="{ color: scope.row.isCancelled === '是' ? 'red' : 'inherit' }"
            >{{ scope.row.isCancelled }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <el-button type="primary" link class="action-text" @click.stop="toggleExpand(scope.row)">
            {{ expandedRows.includes(scope.row.id) ? '收合' : '展開' }}
            <el-icon v-if="expandedRows.includes(scope.row.id)"><CaretTop /></el-icon>
            <el-icon v-else><CaretBottom /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        class="mt-4"
        :total="memberList.length"
      />
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

/* 頂部資訊列 */
.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.info-content {
  display: flex;
  align-items: center;
  gap: 20px;
}
.label {
  font-weight: bold;
  color: $title-col;
}
.val {
  color: $text-color;
}
.export-btn {
  border: 1px solid $secondary-color;
  color: $secondary-color;
  background: transparent;
  &:hover {
    background-color: $secondary-color;
    color: $text-white;
  }
}

/* 表格樣式 */
:deep(.custom-header th) {
  background-color: $card-color !important;
  color: $text-color;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid none;
}
:deep(.el-table__row) {
  cursor: default;
}
:deep(.hide-expand-icon .el-table__expand-icon) {
  display: none;
}
:deep(.el-table__expand-column .el-table__expand-icon) {
  display: none;
}

.checkbox-mock {
  width: 18px;
  height: 18px;
  border: 2px solid $highlight-color1;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkbox-mock.checked {
  color: $highlight-color1;
  font-weight: bold;
}

/* 展開區域樣式 (米色背景) */
:deep(.el-table__expanded-cell) {
  background-color: $disable-col !important;
  padding: 20px 50px !important;
}
.expand-detail {
  padding: 10px;
}
.detail-item {
  margin-bottom: 15px;
  border-bottom: 1px solid $disable-col;
  padding-bottom: 5px;
  display: flex;
  align-items: center;
}
.d-label {
  font-weight: bold;
  min-width: 120px;
  color: $text-color;
}

.eye-icon {
  cursor: pointer;
  font-size: 16px;
  color: #666;
  margin-left: 8px;
  transition: color 0.3s;
}
.eye-icon:hover {
  color: $highlight-color1;
}

.action-text {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.action-text:hover {
  color: $highlight-color1;
}

/* 分頁 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
