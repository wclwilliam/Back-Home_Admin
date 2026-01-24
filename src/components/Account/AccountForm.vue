<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  /**
   * create: 新增
   * edit: 編輯
   */
  mode: { type: String, default: 'create' }, // 'create' | 'edit'

  /**
   * 表單資料（支援 v-model）
   * 建議欄位：
   * - account: string
   * - name: string
   * - password: string
   * - role: 'general' | 'super' | string
   * - status: 1 | 0
   */
  modelValue: {
    type: Object,
    default: () => ({
      account: '',
      name: '',
      password: '',
      role: 'general',
      status: 1,
    }),
  },

  /**
   * 編輯時是否允許修改帳號（通常不給改）
   */
  accountDisabled: { type: Boolean, default: false },

  /**
   * 編輯模式時，密碼是否必填
   * 很多後台是：編輯時密碼可留空代表不變
   */
  requirePasswordOnEdit: { type: Boolean, default: false },

  /**
   * 送出中（按鈕 loading）
   */
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const isEdit = computed(() => props.mode === 'edit')

const submitText = computed(() => (isEdit.value ? '儲存' : '新增'))

// 內部表單（避免直接改 props）
const form = reactive({
  account: '',
  name: '',
  password: '',
  role: 'general',
  status: 1,
})

watch(
  () => props.modelValue,
  (val) => {
    const safe = val ?? {}
    form.account = safe.account ?? ''
    form.name = safe.name ?? ''
    form.password = safe.password ?? ''
    form.role = safe.role ?? 'general'
    form.status = safe.status ?? 1
  },
  { immediate: true, deep: true },
)

const formRef = ref()

const rules = computed(() => {
  const passwordRules = [{ required: true, message: '請輸入管理員密碼', trigger: 'blur' }]

  // 編輯模式常見：密碼不必填，留空代表不更新
  const editPasswordRules = props.requirePasswordOnEdit
    ? passwordRules
    : [
        {
          validator: (_, value, cb) => {
            // 可留空；有輸入則至少 6 碼（你可改成後端規則）
            if (!value) return cb()
            if (String(value).length < 6) return cb(new Error('密碼至少 6 碼'))
            return cb()
          },
          trigger: 'blur',
        },
      ]

  return {
    account: [
      { required: true, message: '請輸入管理員帳號', trigger: 'blur' },
      { min: 4, max: 30, message: '帳號長度需 4~30 字', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9_]+$/,
        message: '帳號只允許英數與底線 _',
        trigger: 'blur',
      },
    ],
    name: [{ required: true, message: '請輸入管理員姓名', trigger: 'blur' }],
    password: isEdit.value ? editPasswordRules : passwordRules,
    role: [{ required: true, message: '請選擇管理角色', trigger: 'change' }],
    status: [{ required: true, message: '請選擇狀態', trigger: 'change' }],
  }
})

const roleOptions = [
  { label: '一般管理員', value: 'general' },
  { label: '超級管理員', value: 'super' },
]

const statusOptions = [
  { label: '啟用', value: 1 },
  { label: '停用', value: 0 },
]

const syncToVModel = () => {
  emit('update:modelValue', { ...form })
}

const handleCancel = () => {
  emit('cancel')
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 編輯模式：若密碼留空且允許不填，就不要送 password（常見做法）
    const payload = { ...form }
    if (isEdit.value && !props.requirePasswordOnEdit && !payload.password) {
      delete payload.password
    }

    emit('submit', payload)
    // 這裡不直接呼叫 API，讓外層頁面負責（更好測試&維護）
  } catch (e) {
    ElMessage.error('請確認欄位填寫是否正確')
  }
}
</script>

<template>
  <div class="account-form__body">
    <slot name="hint" />

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="account-form__el"
      @change="syncToVModel"
    >
      <el-form-item label="管理員帳號" prop="account">
        <el-input
          v-model.trim="form.account"
          class="w-input"
          :disabled="accountDisabled || isEdit"
          autocomplete="off"
          @input="syncToVModel"
        />
      </el-form-item>

      <el-form-item label="管理員姓名" prop="name">
        <el-input
          v-model.trim="form.name"
          class="w-input"
          autocomplete="off"
          @input="syncToVModel"
        />
      </el-form-item>

      <el-form-item label="管理員密碼" prop="password">
        <el-input
          v-model="form.password"
          class="w-input"
          type="password"
          show-password
          autocomplete="new-password"
          placeholder="請輸入密碼"
          @input="syncToVModel"
        />
        <div v-if="isEdit && !requirePasswordOnEdit" class="account-form__tip">
          留空代表不更改密碼
        </div>
      </el-form-item>

      <el-form-item label="管理角色" prop="role">
        <el-select v-model="form.role" class="w-select" placeholder="請選擇" @change="syncToVModel">
          <el-option
            v-for="opt in roleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="狀態" prop="status">
        <el-select
          v-model="form.status"
          class="w-select-sm"
          placeholder="請選擇"
          @change="syncToVModel"
        >
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <slot />

      <div class="account-form__actions">
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ submitText }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.account-form {
  &__body {
    display: flex;
    justify-content: center;
    padding-top: 10px;
  }

  &__el {
    width: min(720px, 100%);
  }

  &__tip {
    margin-top: 6px;
    font-size: 12px;
    color: #7a8a99;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 26px;
    padding-right: 8px;
  }
}

.w-input {
  width: 420px;
}

.w-select {
  width: 160px;
}

.w-select-sm {
  width: 90px;
}
</style>
