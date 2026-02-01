<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AccountForm from '@/components/Account/AccountForm.vue'
import AdminHeader from '@/components/AdminHeader.vue'
import { adminAccountAPI } from '@/utils/adminApi'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const pageLoading = ref(false)

const formData = ref({
  ADMIN_ID: '',
  ADMIN_NAME: '',
  ADMIN_PWD: '',
  ADMIN_ROLE: 'general',
  ADMIN_ACTIVE: 1,
})

// 如果編輯的是超級管理員，則禁用狀態欄位
const isSuper = computed(() => formData.value.ADMIN_ROLE === 'super')

// 判斷當前登入用戶是否為一般管理員
const isCurrentUserGeneral = computed(() => userStore.user?.ADMIN_ROLE === 'general')

// 一般管理員編輯時，角色和狀態都要 disable
const shouldDisableRole = computed(() => isCurrentUserGeneral.value)
const shouldDisableStatus = computed(() => isSuper.value || isCurrentUserGeneral.value)

onMounted(async () => {
  pageLoading.value = true
  try {
    const response = await adminAccountAPI.getDetail(route.params.id)
    const data = response.item

    // 填充表單資料，密碼不回填
    formData.value = {
      ADMIN_ID: data.ADMIN_ID || '',
      ADMIN_NAME: data.ADMIN_NAME || '',
      ADMIN_PWD: '', // 密碼不要回填
      ADMIN_ROLE: data.ADMIN_ROLE || 'general',
      ADMIN_ACTIVE: data.ADMIN_ACTIVE ?? 1,
    }
  } catch (error) {
    console.error('獲取帳號資料失敗:', error)
    ElMessage.error('獲取帳號資料失敗，請稍後重試')
    router.back()
  } finally {
    pageLoading.value = false
  }
})

const handleSubmit = async (payload) => {
  loading.value = true
  try {
    await adminAccountAPI.update(route.params.id, payload)
    ElMessage.success('更新管理員帳號成功')
    router.push({ name: 'admin-account' })
  } catch (error) {
    console.error('更新失敗:', error)

    // 根據錯誤類型顯示不同訊息
    if (error.message === 'admin_user not found') {
      ElMessage.error('找不到該管理員帳號')
    } else if (error.message === 'password must be at least 6 characters') {
      ElMessage.error('密碼至少需要 6 個字元')
    } else if (error.message === 'invalid admin_role') {
      ElMessage.error('無效的管理員角色')
    } else {
      ElMessage.error('更新失敗，請稍後重試')
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => router.back()
</script>

<template>
  <div class="pageContainer" v-loading="pageLoading">
    <AdminHeader title="編輯管理員" />
    <AccountForm v-if="!pageLoading" v-model="formData" mode="edit" :loading="loading" :require-password-on-edit="false"
      :status-disabled="shouldDisableStatus" :role-disabled="shouldDisableRole" @submit="handleSubmit"
      @cancel="handleCancel" />
  </div>
</template>
<style lang="scss" scoped>
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
