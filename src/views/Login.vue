<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const account = ref('')
const password = ref('')
const loading = ref(false)

const onLogin = async () => {
  loading.value = true
  try {
    const success = await userStore.login(account.value, password.value)
    if (!success) return

    // 登入成功 → 回原本頁面 or 後台首頁
    const redirect = route.query.redirect || { name: 'admin-account' }
    router.replace(redirect)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- LOGO -->
      <img src="@/assets/images/logo.png" alt="logo" class="logo" />
      <p class="title">龜途後台管理系統</p>
      <!-- 登入表單 -->
      <el-form class="login-form">
        <el-form-item>
          <el-input v-model="account" placeholder="請輸入帳號" clearable />
        </el-form-item>

        <el-form-item>
          <el-input v-model="password" type="password" placeholder="請輸入密碼" show-password clearable
            @keyup.enter="onLogin" />
        </el-form-item>

        <p v-if="userStore.errorMsg" class="error">
          {{ userStore.errorMsg }}
        </p>

        <el-button type="primary" class="login-btn" size="large" :loading="loading" @click="onLogin">
          登入
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  background: url('@/assets/images/login-bg.jpg') center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 360px;
  padding: 32px 28px;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  text-align: center;
}

.logo {
  width: 180px;
  margin-bottom: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}

.error {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 4px;
}

.title {
  margin-bottom: 24px;
}
</style>
