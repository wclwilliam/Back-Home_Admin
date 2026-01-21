<script setup>
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/utils/auth'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const account = ref('')
const password = ref('')

const handleLogin = () => {
    auth.loginSuccess() //登入狀態設定為true

    //看原本從哪裡來
    const targetPath = route.query.redirect || '/'

    router.push(targetPath)

}

const onLogin = () => {
    userStore.login(account.value, password.value)
}

</script>
<template>
    <h1>登入畫面</h1>
    <button @click="handleLogin">點我登入</button>

    <el-form label-position="top" class="login-form">
        <!-- 帳號 -->
        <el-form-item label="帳號">
            <el-input v-model="account" placeholder="請輸入帳號" clearable />
        </el-form-item>

        <!-- 密碼 -->
        <el-form-item label="密碼">
            <el-input v-model="password" type="password" placeholder="請輸入密碼" show-password clearable />
        </el-form-item>
        {{ useUserStore.isLogin ? 1 : 0 }}
        <!-- 登入按鈕 -->
        <el-button type="primary" class="login-btn" @click="onLogin">
            登入
        </el-button>
        {{ useUserStore.errorMsg }}
    </el-form>
</template>

<style scoped>
.login-form {
    width: 320px;
}

.login-btn {
    width: 100%;
}
</style>