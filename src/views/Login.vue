<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const account = ref('')
const password = ref('')

const onLogin = () => {
  const success = userStore.login(account.value, password.value)

  if (!success) return

  // 登入成功 → 回原本頁面 or 後台首頁
  const redirect = route.query.redirect || { name: 'admin-account' }
  router.replace(redirect)
}
</script>

<template>
  <h1>登入畫面</h1>

  <el-form label-position="top" class="login-form">
    <!-- 帳號 -->
    <el-form-item label="帳號">
      <el-input v-model="account" placeholder="請輸入帳號" clearable />
    </el-form-item>

    <!-- 密碼 -->
    <el-form-item label="密碼">
      <el-input
        v-model="password"
        type="password"
        placeholder="請輸入密碼"
        show-password
        clearable
      />
    </el-form-item>

    <!-- 錯誤訊息 -->
    <p v-if="userStore.errorMsg" class="error">
      {{ userStore.errorMsg }}
    </p>

    <!-- 登入按鈕 -->
    <el-button type="primary" class="login-btn" @click="onLogin"> 登入 </el-button>
  </el-form>
</template>

<style scoped>
.login-form {
  width: 320px;
}

.login-btn {
  width: 100%;
}

.error {
  color: red;
  margin-bottom: 8px;
}
</style>
