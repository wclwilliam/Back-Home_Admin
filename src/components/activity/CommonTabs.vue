<script setup>
defineProps({
  // 目前選中
  modelValue: {
    type: [String, Number],
    required: true,
  },
  tabs: {
    type: Array,
    required: true,
    default: () => [],
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
      <el-tab-pane v-for="tab in tabs" :key="tab.value" :label="tab.label" :name="tab.value" />
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.custom-tabs-header {
  background: $bg-color;
  padding-top: 20px;
  border-bottom: 1px solid $highlight-color1;
}

:deep(.el-tabs__header) {
  margin: 0;
}

// 選中狀態
:deep(.el-tabs__item.is-active) {
  background-color: $highlight-color1 !important;
  color: $text-white !important;
  border-bottom-color: $highlight-color1 !important;
}

// 一般狀態
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
