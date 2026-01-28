<script setup>
import { computed } from 'vue'

// 定義 Props：接收父組件傳入的總數、目前頁碼、每頁筆數
const props = defineProps({
  total: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 }
})

// 定義 Emits：通知父組件數據更新
const emit = defineEmits(['update:currentPage' , 'change'])

// 使用 computed 的 get/set 實現雙向綁定同步
const internalCurrentPage = computed({
  get: () => props.currentPage,
  set: (val) => emit('update:currentPage', val)
})


// 當頁碼或筆數改變時，統一觸發一個 change 事件供父組件抓取 API (如果有需要的話)
const handleSizeChange = (val) => {
  emit('change')
}
const handleCurrentChange = (val) => {
  emit('change')
}
</script>
<template>
  <div class="paginationSection">
    <el-pagination
      v-model:current-page="internalCurrentPage"
      :total="total"
      background
      layout="prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<style lang="scss" scoped>
.paginationSection {
    margin-top: 24px;
    display: flex;
    justify-content: center;
}
</style>