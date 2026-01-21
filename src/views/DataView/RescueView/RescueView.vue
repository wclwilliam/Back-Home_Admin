<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const handleAdd = () => {
  router.push({ name: 'rescueAdd' })
}

const handleEdit = (id) => {
  router.push({ name: 'rescueEdit', params: { id } })
}

// 模擬資料
const tableData = [
  {
    id: '01',
    name: '阿福',
    species: '綠蠵龜',
    location: '澎湖',
    story:
      '2025年10月發現於澎湖龍門沙灘，遭廢棄漁網纏繞導致左前肢壞死。阿福剛來時極度虛弱，經過截肢手術後，目前正在練習用三隻鰭狀肢游泳，每天的餐費與藥費是牠最大的支柱。',
    stage: '醫療照護',
    photo: 'afu.jpg',
  },
  {
    id: '02',
    name: '阿福',
    species: '綠蠵龜',
    location: '澎湖',
    story:
      '2025年10月發現於澎湖龍門沙灘，遭廢棄漁網纏繞導致左前肢壞死。阿福剛來時極度虛弱，經過截肢手術後，目前正在練習用三隻鰭狀肢游泳，每天的餐費與藥費是牠最大的支柱。',
    stage: '休養觀察',
    photo: 'afu.jpg',
  },
  {
    id: '03',
    name: '阿福',
    species: '綠蠵龜',
    location: '澎湖',
    story:
      '2025年10月發現於澎湖龍門沙灘，遭廢棄漁網纏繞導致左前肢壞死。阿福剛來時極度虛弱，經過截肢手術後，目前正在練習用三隻鰭狀肢游泳，每天的餐費與藥費是牠最大的支柱。',
    stage: '準備野放',
    photo: 'afu.jpg',
  },
]
</script>

<template>
  <div class="toolbarSection">
    <div class="filters">
      <!-- 佔位，保持排版一致 -->
    </div>

    <el-button plain class="addBtn" @click="handleAdd">新增資料</el-button>
  </div>

  <el-table :data="tableData" style="width: 100%" class="customTable">
    <el-table-column prop="id" label="序號" width="80" align="center" />
    <el-table-column prop="name" label="姓名" width="100" align="center" />
    <el-table-column prop="species" label="品種" width="100" align="center" />
    <el-table-column prop="location" label="發現地點" width="100" align="center" />
    <el-table-column prop="story" label="受傷原因與故事文案" min-width="300" header-align="center">
      <template #default="scope">
        <div class="story-cell">
          {{ scope.row.story }}
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="stage" label="救治階段" width="120" align="center" />
    <el-table-column prop="photo" label="海龜照片" width="120" align="center">
      <template #default="scope">
        <span class="photo-link">{{ scope.row.photo }}</span>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="150" align="center">
      <template #default="scope">
        <div class="operation-cell">
          <el-button link class="op-btn" @click="handleEdit(scope.row.id)">編輯</el-button>
          <span class="op-divider">/</span>
          <el-button link class="op-btn">刪除</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>

  <div class="paginationSection">
    <el-pagination background layout="prev, pager, next" :total="50" />
  </div>
</template>

<style lang="scss" scoped>
// 工具列
.toolbarSection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
}

.customTable {
  :deep(th.el-table__cell) {
    background-color: $backstage-bar-color;
    font-size: 14px;
    color: $text-color;
    font-weight: bold;
    border-bottom: none;
  }

  :deep(.el-table__row) {
    background-color: #f5f7f7; // 淺灰底色，模仿圖片
  }
}

.story-cell {
  text-align: left;
  line-height: 1.5;
}

.photo-link {
  text-decoration: underline;
  cursor: pointer;
}

.operation-cell {
  .op-btn {
    color: #333;
    font-weight: bold;
    text-decoration: underline;
    &:hover {
      color: $secondary-color;
    }
  }
  .op-divider {
    margin: 0 4px;
    font-weight: bold;
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
