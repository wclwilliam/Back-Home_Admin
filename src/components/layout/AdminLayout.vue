<script setup>
// 記得引入 icon
import { User, Bell, Calendar, Money, DataLine, ArrowRight, Avatar } from '@element-plus/icons-vue'
</script>

<template>
  <el-container class="layout-container">
    <el-aside width="250px" class="aside-menu">

      <el-menu default-active="1" class="el-menu-vertical">
        <div class="menu-title"></div>

        <el-menu-item index="1">
          <el-icon>
            <Avatar />
          </el-icon>
          <span>後台帳號管理</span>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="2">
          <el-icon>
            <Bell />
          </el-icon>
          <span>最新消息管理</span>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="3">
          <el-icon>
            <Calendar />
          </el-icon>
          <span>志工活動管理</span>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="4">
          <el-icon>
            <Money />
          </el-icon>
          <span>捐款管理</span>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="5">
          <el-icon>
            <DataLine />
          </el-icon>
          <span>保育數據管理</span>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="6">
          <el-icon>
            <User />
          </el-icon>
          <span>會員中心管理</span>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-main>
      <h1>頁面內容放這邊</h1>
    </el-main>

    
  </el-container>
</template>


<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

.aside-menu {
  background-color: $primary-color;
}

.el-menu {
  border-right: none !important;
  color: $text-color;
}

.el-menu-vertical {
  border-right: none;
}

.menu-title {
  height: 50px;
  background-color: $primary-color;
}

.el-menu-item {
  font-size: 16px;
  border-bottom: 2px solid $backstage-bar-line-color;
  display: flex;
  justify-content: space-between;
  background-color: $backstage-bar-color;
}

.el-menu-item.is-active {
  background-color: $backstage-bar-click-color;
  color: $text-color;
}
</style>
