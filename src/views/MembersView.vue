<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminHeader from '@/components/AdminHeader.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import Pagination from '@/components/Pagination.vue'
import { memberAPI } from '@/utils/adminApi'
import { formatDate } from '@/utils/formatTime'

const router = useRouter()

// 搜尋與排序狀態
const sortBy = ref('')
const keyword = ref('')

// 排序選項
const sortOptions = [
    { label: '排序', value: '' },

    // 註冊日期
    { label: '最新註冊', value: 'created_desc' },
    { label: '最早註冊', value: 'created_asc' },

    // 會員編號
    { label: '會員編號 (小 → 大)', value: 'id_asc' },
    { label: '會員編號 (大 → 小)', value: 'id_desc' },

    // 姓名
    { label: '姓名筆畫 (少 → 多)', value: 'name_asc' },
    { label: '姓名筆畫 (多 → 少)', value: 'name_desc' },

    // 帳號狀態
    { label: '啟用優先', value: 'active_first' },
    { label: '停用優先', value: 'inactive_first' },
]

// 分頁狀態
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表格資料與載入狀態
const tableData = ref([])
const loading = ref(false)

// 獲取會員列表
const fetchMemberList = async () => {
    loading.value = true
    try {
        const response = await memberAPI.getList({
            page: currentPage.value,
            pageSize: pageSize.value,
            keyword: keyword.value,
            sortBy: sortBy.value,
        })

        // 確保 MEMBER_ACTIVE 是數字型別
        tableData.value = (response.items || []).map(item => ({
            ...item,
            MEMBER_ACTIVE: Number(item.MEMBER_ACTIVE)
        }))
        total.value = response.pagination?.total || 0
    } catch (error) {
        ElMessage.error(error.message || '獲取會員列表失敗，請稍後重試')
    } finally {
        loading.value = false
    }
}

// 跳轉至詳情頁
const handleViewDetail = (row) => {
    router.push({ name: 'admin-members-detail', params: { id: row.MEMBER_ID } })
}

// 切換會員狀態
const handleStatusChange = async (row, val) => {
    try {
        const status = val ? 1 : 0
        await memberAPI.updateStatus(row.MEMBER_ID, status)
        ElMessage.success('狀態更新成功')
        row.MEMBER_ACTIVE = status
    } catch (error) {
        ElMessage.error(error.message || '狀態更新失敗')
        // 還原狀態
        row.MEMBER_ACTIVE = row.MEMBER_ACTIVE === 1 ? 0 : 1
    }
}

// 處理搜尋行為
const handleSearch = async ({ sortBy: sb, searchQuery }) => {
    sortBy.value = sb ?? sortBy.value
    keyword.value = searchQuery ?? keyword.value
    currentPage.value = 1 // 搜尋時重置到第一頁
    await fetchMemberList()
}

// 分頁變化
const handlePageChange = async (page) => {
    currentPage.value = page
    await fetchMemberList()
}

// 頁面載入時獲取資料
onMounted(() => {
    fetchMemberList()
})
</script>

<template>
    <div class="pageContainer">
        <AdminHeader title="會員中心管理" />

        <TableToolbar v-model:modelValueSort="sortBy" v-model:modelValueSearch="keyword" :sort-options="sortOptions"
            search-placeholder="搜尋姓名 / E-MAIL / 手機號碼" :show-add="false" @search="handleSearch" @change="handleSearch" />

        <el-table :data="tableData" style="width: 100%" class="customTable" v-loading="loading">
            <el-table-column prop="MEMBER_ID" label="會員編號" align="center" />

            <el-table-column prop="MEMBER_REALNAME" label="姓名" align="center" />

            <el-table-column prop="MEMBER_EMAIL" label="E-MAIL" align="center" min-width="200" />

            <el-table-column prop="MEMBER_PHONE" label="手機號碼" align="center" width="150" />

            <el-table-column label="帳號狀態" align="center" width="110">
                <template #default="{ row }">
                    <el-select :model-value="row.MEMBER_ACTIVE" size="small" class="status-select"
                        @change="(val) => handleStatusChange(row, val)">
                        <el-option label="啟用" :value="1" />
                        <el-option label="停用" :value="0" />
                    </el-select>
                </template>
            </el-table-column>

            <el-table-column label="註冊日期" align="center" width="150">
                <template #default="{ row }">
                    {{ formatDate(row.MEMBER_CREATED_AT) }}
                </template>
            </el-table-column>

            <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="handleViewDetail(row)"
                        style="font-weight: bold;">
                        檢視詳情
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <Pagination :total="total" :page-size="pageSize" :current-page="currentPage" @change="handlePageChange" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/base/_var.scss';

.pageContainer {
    padding: 30px;
    background-color: #fff;
    min-height: 100vh;
    box-sizing: border-box;
}

.customTable {
    :deep(th.el-table__cell) {
        background-color: $backstage-bar-color;
        font-size: 14px;
        color: $text-color;
        font-weight: bold;
        border-bottom: none;
    }
}

.pagination-wrapper {
    margin-top: 30px;
    display: flex;
    justify-content: center;
}

/* 停用狀態文字顏色 */
.disabled {
    color: #f56c6c;
}

/* 狀態下拉選單寬度 */
.status-select {
    width: 75px;
}

/* 讓 Switch 內的文字稍微小一點比較美觀 */
:deep(.el-switch__inner) {
    font-size: 11px;
}

/* 調整按鈕顏色與品牌色對齊 */
:deep(.el-button--primary.is-link) {
    color: $primary-color;

    &:hover {
        color: lighten($primary-color, 10%);
    }
}
</style>