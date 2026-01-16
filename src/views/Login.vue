<script setup>
    import { useRouter, useRoute } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'

    const router = useRouter()
    const route = useRoute()
    const auth = useAuthStore()

    const handleLogin = () => {
        auth.loginSuccess() //登入狀態設定為true

        //看原本從哪裡來
        const targetPath = route.query.redirect || '/'
        
        router.push(targetPath)

    }
    
</script>
<template>
    <h1>登入畫面</h1>
    <button @click="handleLogin">點我登入</button>
</template>