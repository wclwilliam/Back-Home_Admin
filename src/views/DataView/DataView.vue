<script setup>
import { ref,computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'



const route = useRoute()
const router = useRouter()

// Tabs 目前選中狀態（由 route 決定） 
const activeTab = computed(() => route.name)


// 點 Tab → 換路由
const handleTabClick = (tab) => {
  router.push({ name: tab.paneName })
}


</script>

<template>
    <div class="pageContainer">
        <AdminHeader title="保育數據管理"/>

        <div class="tabSection">
            <el-tabs :model-value="activeTab" type="card" class="custom-tabs" @tab-click="handleTabClick">
                <el-tab-pane label="我們的影響力" name="impact"/>
                <el-tab-pane label="徵信資料" name="report"/>
                <el-tab-pane label="救援個案" name="rescue"/>
            </el-tabs>
        </div>
        <RouterView />
        
    </div>
</template>

<style scoped lang="scss">
.pageContainer {
padding: 30px; 
  min-height: 100vh;
  box-sizing: border-box;

  /* 自定義 el-tabs 樣式以符合圖片設計 */
.tabSection {
    margin-bottom: 20px;
    
    :deep(.custom-tabs) {
        .el-tabs__header {
            border-bottom: 1px solid $highlight-color1;
            margin: 0;
        }
        .el-tabs__nav {
            gap: 10px;
            margin-bottom: 5px;
        }
        .el-tabs__item {
            border: 1px solid $highlight-color1 !important;
            color: $text-color;
            height: 45px;
            line-height: 45px;
            padding: 0 30px !important;

            &.is-active {
                background-color: $highlight-color1 !important;
                color: white !important;
            }
        }
    }
}
}
</style>
