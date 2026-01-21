<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  // 排序選項（每頁不同）
  sortOptions: {
    type: Array,
    default: () => [
      { label: '最新發布', value: 'newest' },
      { label: '最早發布', value: 'oldest' },
    ],
  },

  // 搜尋提示（可換，預設「搜尋」）
  searchPlaceholder: {
    type: String,
    default: '搜尋',
  },

  // 右側按鈕文字（可換，預設「新增」）
  addText: {
    type: String,
    default: '新增資料',
  },

  // 是否顯示新增按鈕（有些頁面可能不需要）
  showAdd: {
    type: Boolean,
    default: true,
  },

  // 外部可傳入初始值（可選）
  modelValueSort: {
    type: String,
    default: '',
  },
  modelValueSearch: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'update:modelValueSort',
  'update:modelValueSearch',
  'change', // 統一吐出目前狀態（可選）
  'add',
  'search',
])

const sortBy = ref(props.modelValueSort)
const searchQuery = ref(props.modelValueSearch)

// props 變動時同步（避免父層重設值時 toolbar 不更新）
watch(
  () => props.modelValueSort,
  (v) => (sortBy.value = v),
)
watch(
  () => props.modelValueSearch,
  (v) => (searchQuery.value = v),
)

// 內部變動 -> emit
watch(sortBy, (v) => {
  emit('update:modelValueSort', v)
  emit('change', { sortBy: v, searchQuery: searchQuery.value })
})

watch(searchQuery, (v) => {
  emit('update:modelValueSearch', v)
  emit('search', { sortBy: sortBy.value, searchQuery: v })
})

const handleAdd = () => emit('add')
const handleSearch = () => {
  emit('search', { sortBy: sortBy.value, searchQuery: searchQuery.value })
}
</script>

<template>
  <div class="toolbarSection">
    <div class="filters">
      <el-select v-model="sortBy" placeholder="排序" clearable style="width: 120px">
        <el-option
          v-for="opt in sortOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-input
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        clearable
        style="width: 200px"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <el-button v-if="showAdd" plain class="addBtn" @click="handleAdd">
      {{ addText }}
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.toolbarSection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;

  .filters {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  :deep(.el-input) {
    --el-input-border-color: #0e6273;
    --el-input-focus-border-color: #0e6273;
    --el-input-hover-border-color: #0e6273;
  }

  :deep(.el-select) {
    --el-border-color: #0e6273;
    --el-border-color-hover: #0e6273;
    --el-color-primary: #0e6273;
    --el-select-input-focus-border-color: #0e6273;
  }
}

.addBtn {
  border: 1px solid $secondary-color;
  color: $secondary-color;
}
</style>
