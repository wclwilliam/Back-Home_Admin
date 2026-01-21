<script setup>
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
      <span>管理者帳號</span>
      <el-button class="logoutBtn" size="small" plain @click="handleLogoutClick">登出</el-button>
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
    .logoutBtn {
      border: 1px solid $secondary-color;
      color: $secondary-color;
    }
  }
}
</style>
