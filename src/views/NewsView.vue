<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'

const router = useRouter()
const handleAdd = () => {
  router.push({ name: 'news-add' })
}


const sortBy = ref('')
const searchQuery = ref('')

// 模擬資料
const tableData = [
  {
    id: '01',
    category: '重要公告',
    imageUrl: 'https://placehold.co/300x200?text=Turtle+1',
    title: '守護海洋安全第一：【龜途】2025 綠蠵龜棲地守護淨灘活動延期通知',
    date: '2025-12-10\n10:50:04',
    status: '已發布',
  },
  {
    id: '02',
    category: '異動通知',
    imageUrl: 'https://placehold.co/300x200?text=Turtle+2',
    title: '【系統維護】網站伺服器將於 2026/02/01 暫停服務兩小時',
    date: '2025-11-20\n18:30:05',
    status: '草稿',
  },
  {
    id: '03',
    category: '重要公告',
    imageUrl: 'https://placehold.co/300x200?text=Turtle+3',
    title: '還給海龜乾淨的家：2026 小琉球春季大型淨灘招募啟動',
    date: '2025-11-15\n09:00:00',
    status: '已發布',
  },
  {
    id: '04',
    category: '異動通知',
    imageUrl: 'https://placehold.co/300x200?text=Turtle+4',
    title: '【緊急異動】因強烈颱風接近，本週六「海龜生態講座」延期',
    date: '2025-11-08\n14:20:00',
    status: '已發布',
  },
  {
    id: '05',
    category: '異動通知',
    imageUrl: 'https://placehold.co/300x200?text=Turtle+5',
    title: '好消息！重傷綠蠵龜「安安」康復，將於本週日進行野放',
    date: '2025-11-08\n14:20:00',
    status: '已發布',
  },
  {
    id: '06',
    category: '異動通知',
    imageUrl: 'https://placehold.co/300x200?text=Turtle+6',
    title: '【資安升級】會員系統更新說明，請盡快重設您的密碼',
    date: '2025-11-08\n14:20:00',
    status: '已發布',
  },
]
</script>


<template>
  <div class="pageContainer">
      <AdminHeader title="最新消息管理" />

    <div class="toolbarSection">
      <div class="filters">
        <el-select v-model="sortBy" placeholder="排序" style="width: 120px; margin-right: 12px;">
          <el-option label="最新發布" value="newest" />
          <el-option label="最早發布" value="oldest" />
        </el-select>

        <el-input v-model="searchQuery" placeholder="搜尋" style="width: 200px">
          <template #suffix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <el-button plain class="addBtn" @click="handleAdd">新增資料</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" class="customTable" header-row-class-name="tableHeader">

      <el-table-column prop="id" label="文章編號" width="100" align="center" />

      <el-table-column prop="category" label="分類" width="120" align="center" />

      <el-table-column label="封面圖" width="150" align="center">
        <template #default="scope">
          <el-image style="width: 100%; height: 60px; border-radius: 4px; display: block; margin: 0 auto;"
            :src="scope.row.imageUrl" fit="cover" />
        </template>
      </el-table-column>

      <el-table-column prop="title" label="標題" min-width="150" align="center" />

      <el-table-column prop="date" label="發布時間" width="120" align="center">
        <template #default="scope">
          <div style="white-space: pre-line; font-size: 13px;">{{ scope.row.date }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="狀態" width="100" align="center" />

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default>
          <el-button link type="primary" size="small">編輯</el-button>
          <span style="color: #dcdfe6; margin: 0 8px">|</span>
          <el-button link type="danger" size="small">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="paginationSection">
      <el-pagination background layout="prev, pager, next" :total="50" class="mt-4" />
    </div>
  </div>
</template>


<style scoped lang="scss">
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}

.headerSection {
  border-bottom: 2px solid $primary-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;

  .pageTitle {
    font-size: 36px;
    color: $primary-color;
    font-weight: bold;
    margin: 0;
  }

  .userInfo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: $text-color;
  }
}

.logoutBtn {
  border: 1px solid $secondary-color;
  color: $secondary-color;
}

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
