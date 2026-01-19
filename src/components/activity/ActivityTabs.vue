<script setup>
// 定義 Props 與 Emits 以實現 v-model
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="custom-tabs-header">
    <el-tabs
      :model-value="modelValue"
      @update:model-value="(val) => $emit('update:modelValue', val)"
      type="card"
      class="demo-tabs"
    >
      <el-tab-pane label="活動詳情" name="detail"></el-tab-pane>
      <el-tab-pane label="參與名單" name="list"></el-tab-pane>
      <el-tab-pane label="活動成果" name="result"></el-tab-pane>
      <el-tab-pane label="留言管理" name="comment"></el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.custom-tabs-header {
  background: $bg-color;
  padding-top: 20px;
  padding-left: 20px;
  border-bottom: 1px solid $highlight-color1;
}

:deep(.el-tabs__header) {
  margin: 0;
}

/* 複寫選中狀態 */
:deep(.el-tabs__item.is-active) {
  background-color: $highlight-color1 !important;
  color: $text-white !important;
  border-bottom-color: $highlight-color1 !important;
}

/* 複寫一般狀態 */
:deep(.el-tabs--card .el-tabs__item) {
  border: 1px solid $highlight-color1;
  border-top: 2px solid $highlight-color1;
  border-bottom: none;

  background-color: $text-white;
  color: $text-color;
  font-weight: normal;
  width: 160px;
}
:deep(.el-tabs--card .el-tabs__item:first-child) {
  border-left: 1px solid $highlight-color1;
}
:deep(.el-tabs--card .el-tabs__nav) {
  border: none;
  gap: 20px;
}
</style>
