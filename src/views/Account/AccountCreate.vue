<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AccountForm from '@/components/Account/AccountForm.vue'
import AdminHeader from '@/components/AdminHeader.vue'
import { adminAccountAPI } from '@/utils/adminApi'

const router = useRouter()
const loading = ref(false)

const formData = ref({
  ADMIN_ID: '',
  ADMIN_NAME: '',
  ADMIN_PWD: '',
  ADMIN_ROLE: 'general',
  ADMIN_ACTIVE: 1,
})

const handleSubmit = async (payload) => {
  loading.value = true
  try {
    await adminAccountAPI.create(payload)
    ElMessage.success('新增管理員帳號成功')
    router.push({ name: 'admin-account' })
  } catch (error) {
    console.error('新增失敗:', error)

    // 根據錯誤類型顯示不同訊息
    if (error.message === 'admin_id already exists') {
      ElMessage.error('帳號已存在，請使用其他帳號')
    } else if (error.message === 'password must be at least 6 characters') {
      ElMessage.error('密碼至少需要 6 個字元')
    } else if (error.message === 'invalid admin_role') {
      ElMessage.error('無效的管理員角色')
    } else {
      ElMessage.error('新增失敗，請稍後重試')
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => router.back()
</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="新增管理員" />
    <AccountForm v-model="formData" mode="create" :loading="loading" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>

<style lang="scss" scoped>
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
