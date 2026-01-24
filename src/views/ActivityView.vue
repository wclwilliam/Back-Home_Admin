<script setup>
import { ref } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue'
import ActivityListPanel from '@/components/activity/ActivityListPanel.vue'

import jsonData from '@/assets/data/activityData.json'

const activityData = ref(jsonData)

const handleCreate = () => {
  console.log('跳轉到建立活動頁面')
}
</script>

<template>
  <div class="pageContainer">
    <el-container style="height: 100vh">
      <el-main style="background-color: #f4f4f4; padding: 0">
        <AdminHeader title="志工活動管理" />

        <div>
          <ActivityListPanel :raw-data="activityData" @create="handleCreate" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.pageContainer {
  padding: 30px;
  min-height: 100vh;
}
/* 頁面 Header */
.page-header {
  border-bottom: 2px solid $primary-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
}
.page-title {
  color: $primary-color;
  font-size: 36px;
  font-weight: bold;
  letter-spacing: 1px;
  margin: 0;
}
//管理者
.user-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}
.role-text {
  font-weight: bold;
  color: $primary-color;
}
.logout-btn {
  border: 2px solid $secondary-color;
  color: $secondary-color;
  font-weight: bold;
  border-radius: 0;
  padding: 15px 25px;
  background: transparent;
}
.logout-btn:hover {
  background: $secondary-color;
  color: $bg-color;
}
</style>
