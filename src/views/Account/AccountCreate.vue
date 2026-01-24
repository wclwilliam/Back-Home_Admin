<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AccountForm from '@/components/Account/AccountForm.vue'
import AdminHeader from '@/components/AdminHeader.vue'

const router = useRouter()
const loading = ref(false)

const formData = ref({
  account: '',
  name: '',
  password: '',
  role: 'general',
  status: 1,
})

const handleSubmit = async (payload) => {
  loading.value = true
  try {
    // await apiCreateAccount(payload)
    router.push({ name: 'admin-account-list' })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => router.back()
</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="新增管理員帳號" />
    <AccountForm
      v-model="formData"
      mode="create"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style lang="scss" scoped>
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
