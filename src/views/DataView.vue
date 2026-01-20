<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

// Tab 狀態 (對應 el-tab-pane 的 name)
const activeTab = ref('report')

// 搜尋與篩選
const sortBy = ref('')

// 模擬資料
const tableData = [
    { id: '01', year: '2023', date: '2023/01/01 18:08:21', fileName: '測試.jpg' },
    { id: '02', year: '2024', date: '2024/01/03 12:12:12', fileName: '測試.jpg' },
    { id: '03', year: '2025', date: '2025/01/02 17:55:30', fileName: '測試.jpg' },
]
</script>

<template>
    <div class="pageContainer">
        <div class="headerSection">
            <h2 class="pageTitle">保育數據管理</h2>
            <div class="userInfo">
                <span>管理者帳號</span>
                <el-button size="small" plain>登出</el-button>
            </div>
        </div>

        <div class="tabSection">
            <el-tabs v-model="activeTab" type="card" class="custom-tabs">
                <el-tab-pane label="我們的影響力" name="impact" />
                <el-tab-pane label="徵信資料" name="report" />
                <el-tab-pane label="救援個案" name="rescue" />
            </el-tabs>
        </div>

        <div class="toolbarSection">
            <div class="filters">
                <el-select v-model="sortBy" placeholder="排序" style="width: 120px; margin-right: 12px;">
                    <el-option label="最新捐款" value="newest" />
                    <el-option label="最早捐款" value="oldest" />
                </el-select>
            </div>

            <el-button type="primary" plain class="addBtn">新增資料</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" class="customTable">
            <el-table-column prop="id" label="資料編號" width="100" align="center" />
            <el-table-column prop="year" label="資料年份" width="120" align="center" />
            <el-table-column prop="date" label="上傳日期" min-width="180" align="center" />
            <el-table-column prop="fileName" label="檔案名稱" min-width="150" align="center" />

            <el-table-column label="操作" width="150" align="center">
                <template #default>
                    <div class="operation-cell">
                        <el-button link type="primary" size="small">編輯</el-button>
                        <span style="color: #dcdfe6; margin: 0 8px">|</span>
                        <el-button link type="danger" size="small">刪除</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <div class="paginationSection">
            <el-pagination background layout="prev, pager, next" :total="50" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.pageContainer {
    padding: 70px;
    min-height: 100vh;
}

.headerSection {
    border-bottom: 2px solid $primary-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 24px;

    .pageTitle {
        font-size: 36px;
        color: $primary-color;
        font-weight: bold;
        margin: 0;
    }

    .userInfo {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: $text-color;
    }
}

/* 工具列區 */
.toolbarSection {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 12px 16px;
}

.customTable {
    :deep(th.el-table__cell) {
        background-color: $backstage-bar-color ;
        color: $text-color;
        font-weight: bold;
        border-bottom: none;
    }
}


.paginationSection {
    margin-top: 24px;
    display: flex;
    justify-content: center;
}

.addBtn {
    border-color: $secondary-color;
    color: $secondary-color;
}
</style>