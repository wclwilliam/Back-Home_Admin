<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AccountForm from '@/components/Account/AccountForm.vue'
import AdminHeader from '@/components/AdminHeader.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const formData = ref({
  account: '',
  name: '',
  password: '',
  role: 'general',
  status: 1,
})

onMounted(async () => {
  // const data = await apiGetAccount(route.params.id)
  // formData.value = { ...data, password: '' } // 密碼不要回填
})

const handleSubmit = async (payload) => {
  loading.value = true
  try {
    // await apiUpdateAccount(route.params.id, payload)
    router.push({ name: 'admin-account-list' })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => router.back()
</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="編輯管理員帳號" />
    <AccountForm
      v-model="formData"
      mode="edit"
      :loading="loading"
      :require-password-on-edit="false"
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
