<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
// 注意：Money 圖標可能不存在，建議改用 Wallet 或 Coin，這裡我替換為 Wallet
import { User, Bell, Calendar, Wallet, DataLine, ArrowRight, Avatar } from '@element-plus/icons-vue'

const route = useRoute()

// 自動對應當前路由路徑，保持菜單高亮
const activeMenu = computed(() => '/' + route.path.split('/')[1])
</script>

<template>
  <el-container class="layout-container">
    <el-aside width="250px" class="aside-menu">
      <el-menu :default-active="activeMenu" class="el-menu-vertical" :router="true" unique-opened>
        <div class="menu-title">
          <h3 style="color: white; text-align: center; line-height: 50px; margin: 0">Admin</h3>
        </div>

        <el-menu-item index="/account">
          <div class="menu-content">
            <el-icon>
              <Avatar />
            </el-icon>
            <span>後台帳號管理</span>
          </div>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="/news">
          <div class="menu-content">
            <el-icon>
              <Bell />
            </el-icon>
            <span>最新消息管理</span>
          </div>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="/activity">
          <div class="menu-content">
            <el-icon>
              <Calendar />
            </el-icon>
            <span>志工活動管理</span>
          </div>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="/donations">
          <div class="menu-content">
            <el-icon>
              <Wallet />
            </el-icon>
            <span>捐款管理</span>
          </div>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="/data">
          <div class="menu-content">
            <el-icon>
              <DataLine />
            </el-icon>
            <span>保育數據管理</span>
          </div>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>

        <el-menu-item index="/members">
          <div class="menu-content">
            <el-icon>
              <User />
            </el-icon>
            <span>會員中心管理</span>
          </div>
          <el-icon class="arrow-icon">
            <ArrowRight />
          </el-icon>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-main class="main-content">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
/* 注意：使用 SCSS 變數 ($primary-color) 必須確保你有配置
  vite.config.js 的 css.preprocessorOptions.scss.additionalData 
  否則會報錯。為了演示方便，我下面用註解標示變數，實際代碼使用 Hex 顏色。
*/

// $primary-color: #2b303b;
// $text-color: #ffffff;
// $backstage-bar-color: #333744;
// $backstage-bar-click-color: #409EFF;
// $backstage-bar-line-color: #4a5064;

.layout-container {
  height: 100vh;
  width: 100vw;
}

.aside-menu {
  background-color: $primary-color;
  overflow-x: hidden;
}

.el-menu-vertical {
  border-right: none;
  background-color: transparent;
  /* 讓 menu 背景透明，吃 aside 的色 */
}

.menu-title {
  height: 50px;
  background-color: #2b303b;
  /* $primary-color */
  border-bottom: 1px solid #4a5064;
}

.el-menu-item {
  font-size: 16px;
  border-bottom: 1px solid $backstage-bar-line-color;
  background-color: $card-color;
  color: $text-color;

  /* Flex 佈局優化 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
  /* 箭頭離右邊一點 */
}

/* 將左側 Icon 和文字包在一起，避免被 space-between 分開 */
.menu-content {
  display: flex;
  align-items: center;
  gap: 10px;
  /* 圖標和文字的間距 */
}

/* Hover 效果 */
.el-menu-item:hover {
  background-color: $game-line-color;
}

/* 選中狀態 (Active) */
.el-menu-item.is-active {
  background-color: $backstage-bar-click-color !important;
}

/* 右側內容區背景，通常給個淺灰區分 */
.main-content {
  background-color: $bg-color;
  padding: 20px;
}
</style>
