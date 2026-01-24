<script setup>
import { ref, computed, reactive } from 'vue'
import { Check, CaretBottom, CaretTop, View, Hide } from '@element-plus/icons-vue'
import SignUpData from '@/assets/data/activitySingUpData.json'
import ActivityData from '@/assets/data/activityData.json'

// 接收父層傳來的基本資訊
const props = defineProps({
  activityId: { type: [String, Number], default: '' },
  activityTitle: { type: String, default: '' },
})

const tableRef = ref(null)
const expandedRows = ref([]) // 紀錄目前展開的活動 ID

// 身分證遮罩處理
const visibleIdMap = reactive({})
const toggleIdVisibility = (id) => {
  visibleIdMap[id] = !visibleIdMap[id]
}
const maskIdNumber = (val) => {
  if (!val || val.length < 5) return '*****'
  return val.substring(0, 3) + '*****' + val.substring(val.length - 2)
}
//取得活動最大報名人數
const maxPeople = computed(() => {
  const targetId = parseInt(props.activityId)
  if (!targetId) return 0
  const activity = ActivityData.find((item) => item.ACTIVITY_ID === targetId)
  return activity ? activity.ACTIVITY_MAX_PEOPLE : 0
})
const memberList = computed(() => {
  const targetId = parseInt(props.activityId)

  if (!targetId) return []
  return SignUpData.filter((item) => item.ACTIVITY_ID === targetId)
    .sort((a, b) => a.ACTIVITY_SIGNUP_ID - b.ACTIVITY_SIGNUP_ID)
    .map((item) => ({
      id: item.ACTIVITY_SIGNUP_ID,
      memberId: item.USER_ID,
      name: item.REAL_NAME,
      email: item.EMAIL,
      phone: item.PHONE,
      attended: true,
      signupTime: item.CREATED_AT ? item.CREATED_AT.replace('', '') : '',
      isCancelled: item.CANCEL === 1 ? '是' : '否',
      birthday: item.BIRTHDAY,
      idNumber: item.ID_NUMBER,
      emergencyContact: item.EMERGENCY,
      emergencyPhone: item.EMERGENCY_TEL,
    }))
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
</script>
<template>
  <div class="tab-container">
    <div class="info-bar">
      <div class="info-content">
        <span class="label">目前報名狀態</span>
        <span class="val">{{ memberList.length }}/{{ maxPeople }} 人</span>
      </div>
      <el-button class="export-btn">匯出名單 (Excel)</el-button>
    </div>

    <el-table
      ref="tableRef"
      :data="memberList"
      style="width: 100%"
      header-row-class-name="custom-header"
      row-class-name="custom-row"
    >
      <el-table-column type="expand">
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
          <span class="action-text" @click.stop="toggleExpand(scope.row)">
            {{ expandedRows.includes(scope.row.id) ? '收合' : '展開' }}
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
  background-color: $backstage-bar-color !important;
  color: $text-color;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid none;
}
:deep(.el-table__row) {
  cursor: default;
}

.checkbox-mock {
  width: 18px;
  height: 18px;
  border: 1px solid $highlight-color1;
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
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
:deep(.el-pagination .el-pager li) {
  background: transparent;
  border-bottom: 2px solid $disable-col;
  border-radius: 0;
  margin: 0 5px;
}
:deep(.el-pagination .el-pager li.is-active) {
  color: $text-color;
  border-bottom-color: $text-color;
  font-weight: bold;
}
</style>
