<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  showLoginoutBtn: {
    //如果不要登出按鈕在自己頁面設  :showLoginoutBtn=false
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '管理頁面',
  },
})

const emit = defineEmits(['logout'])

const router = useRouter()
const userStore = useUserStore()

// 管理員資訊（從 token 解析）
const adminInfo = ref({
  id: null,
  name: null,
  role: null,
})

// 計算顯示文字
const displayText = computed(() => {
  if (!adminInfo.value.id) {
    return '載入中...'
  }
  

  //顯示帳號和姓名
  if (adminInfo.value.name) {
    return `${adminInfo.value.name} (${adminInfo.value.id})`
  }
  return adminInfo.value.id
})

// 從 JWT token 解析管理員資訊
const getAdminFromToken = () => {
  try {
    // 從 localStorage 獲取 token
    const token = localStorage.getItem('ADMIN_TOKEN')
    
    if (!token) {
      adminInfo.value.id = '未登入'
      return
    }
    
    // 解析 JWT token (格式: header.payload.signature)
    const parts = token.split('.')
    if (parts.length !== 3) {
      adminInfo.value.id = 'Token 格式錯誤'
      return
    }
    
    // 解碼 payload (第二部分)
    // 使用 replace 處理 base64url 編碼
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    
    console.log('Token payload:', payload) // 調試用
    
    // 從 payload 中獲取管理員資訊
    // 根據你的 auth_login.php，payload 包含: sub, name, role
    adminInfo.value = {
      id: payload.sub || '未知',
      name: payload.name || null,
      role: payload.role || null,
    }
    
  } catch (error) {
    console.error('解析 token 失敗:', error)
    adminInfo.value.id = '解析失敗'
  }
}

// 組件掛載時獲取管理員資訊
onMounted(() => {
  getAdminFromToken()
})

const handleLogoutClick = () => {
  // 內建登出行為
  userStore.logout()
  router.replace({ name: 'login' })

  // 仍然通知父層（如果有想做額外事：清資料、提示訊息...）
  emit('logout')
}
</script>

<template>
  <div class="headerSection">
    <h2 class="pageTitle">{{ props.title }}</h2>
    <div class="userInfo" v-if="props.showLoginoutBtn">
      <span class="adminName">{{ displayText }}</span>
      <el-button
        class="logoutBtn"
        size="small"
        plain
        @click="handleLogoutClick"
        @keyup.enter="handleLogoutClick"
        >登出</el-button
      >
    </div>
  </div>
</template>

<style scoped lang="scss">
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
    
    .adminName {
      font-weight: 500;
      color: $text-color;
    }
    
    .logoutBtn {
      border: 1px solid $secondary-color;
      color: $secondary-color;
      
      &:hover {
        background-color: $secondary-color;
        color: #fff;
      }
    }
  }
}
</style>