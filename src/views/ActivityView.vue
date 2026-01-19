<script setup>
import { ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import ActivityListPanel from '@/components/activity/ActivityListPanel.vue'

import jsonData from '@/assets/data/activityData.json'

const activityData = ref(jsonData)

const handleCreate = () => {
  console.log('跳轉到建立活動頁面')
}
</script>

<template>
  <div class="common-layout">
    <el-container style="height: 100vh">
      <el-main style="background-color: #f4f4f4; padding: 0">
        <div class="page-header">
          <h1 class="page-title">志工活動管理</h1>
          <div class="user-actions">
            <span class="role-text">管理者帳號</span>
            <el-button class="logout-btn">登出</el-button>
          </div>
        </div>

        <div style="padding: 0 40px">
          <ActivityListPanel :raw-data="activityData" @create="handleCreate" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
/* 側邊欄樣式補強 */
.el-menu-item {
  justify-content: space-between;
  border-bottom: 1px solid #2c4c66;
}
.right-icon {
  margin-right: 0;
}

/* 頁面 Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 40px 20px 40px; /* 下方留白稍微少一點，因為 Control Bar 有 margin */
}
.page-title {
  color: #102a43;
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 1px;
  margin: 0;
}
.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}
.role-text {
  font-weight: bold;
  color: #102a43;
}
.logout-btn {
  border: 2px solid #2c6e88;
  color: #2c6e88;
  font-weight: bold;
  border-radius: 0;
  padding: 15px 25px;
  background: transparent;
}
.logout-btn:hover {
  background: #2c6e88;
  color: #fff;
}
</style>
