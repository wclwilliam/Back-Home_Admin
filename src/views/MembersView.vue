<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import Pagination from '@/components/Pagination.vue'

const router = useRouter()

// 1. 搜尋與排序狀態 (對應 TableToolbar 的 v-model)
const sortBy = ref('created_desc')
const keyword = ref('')

// 排序選項
const sortOptions = [
    { label: '最新註冊', value: 'created_desc' },
    { label: '最早註冊', value: 'created_asc' },
    { label: '姓名 (A-Z)', value: 'name_asc' },
]

// 2. 模擬會員列表資料
const tableData = ref([
    {
    id: 'M00001',
    name: '王曉明',
    email: '123go!@gmail.com',
    phone: '0957634987',
    status: true, // true = 可用, false = 停用
    createdAt: '2025-12-29',
    },
    {
    id: 'M00002',
    name: '李小華',
    email: 'hua_hua@gmail.com',
    phone: '0912345678',
    status: true,
    createdAt: '2025-12-30',
    },
    {
    id: 'M00003',
    name: '陳阿蝦',
    email: 'shrimp@gmail.com',
    phone: '0988777666',
    status: true,
    createdAt: '2026-01-05',
    },
    {
    id: 'M00004',
    name: '陳蝦',
    email: 'sh88mp@gmail.com',
    phone: '0988766866',
    status: true,
    createdAt: '2026-01-15',
    },
    {
    id: 'M00005',
    name: '王豪傑',
    email: 'we88mp@gmail.com',
    phone: '0988334666',
    status: true,
    createdAt: '2026-01-20',
    },
    {
    id: 'M00006',
    name: '林小美',
    email: 'ge93mp@gmail.com',
    phone: '0980544666',
    status: false,
    createdAt: '2026-01-18',
    }
])

// 3. 關鍵功能：跳轉至詳情頁
const handleViewDetail = (row) => {
  // 跳轉至 MembersDetailView.vue，並帶入該會員的 ID
    router.push({ name: 'admin-members-detail', params: { id: row.id } })
}

// 4. 關鍵功能：Switch 切換會員狀態
const handleStatusChange = (row, val) => {
  // val 是切換後的布林值 (true/false)
    console.log(`[API 預備] 會員編號: ${row.id}, 新狀態: ${val ? '可用' : '停用'}`)
  // TODO: 此處之後串接 axios.patch 更新狀態
}

// 5. 搜尋過濾邏輯 (前端模擬)
const filteredTableData = computed(() => {
    if (!keyword.value) return tableData.value
    const q = keyword.value.trim().toLowerCase()
    return tableData.value.filter((row) => {
        return row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q)
    })
})

// 處理搜尋行為
const handleSearch = ({ sortBy: sb, searchQuery }) => {
    sortBy.value = sb ?? sortBy.value
    keyword.value = searchQuery ?? keyword.value
    console.log('搜尋觸發:', { sortBy: sortBy.value, keyword: keyword.value })
}
</script>

<template>
    <div class="pageContainer">
    <AdminHeader title="會員中心管理" />

    <TableToolbar
        v-model:modelValueSort="sortBy"
        v-model:modelValueSearch="keyword"
        :sort-options="sortOptions"
        search-placeholder="搜尋姓名 / E-MAIL"
        :show-add="false" 
        @search="handleSearch"
    />

    <el-table 
        :data="filteredTableData" 
        style="width: 100%" 
        class="customTable"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#333', fontWeight: 'bold' }"
    >
        <el-table-column prop="id" label="會員編號" align="center" width="120" />
        
        <el-table-column prop="name" label="姓名" align="center" />
        
        <el-table-column prop="email" label="E-MAIL" align="center" min-width="200" />
        
        <el-table-column prop="phone" label="手機號碼" align="center" width="150" />
        
        <el-table-column label="帳號狀態" align="center" width="150">
        <template #default="{ row }">
            <el-switch
            v-model="row.status"
            inline-prompt
            active-text="可用"
            inactive-text="停用"
            active-color="#2d8c8c" 
            inactive-color="#ff4949"
            @change="(val) => handleStatusChange(row, val)"
            />
        </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="註冊日期" align="center" width="150" />

        <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
            <el-button 
            link 
            type="primary" 
            size="small" 
            @click="handleViewDetail(row)"
            style="font-weight: bold;"
            >
            檢視詳情
            </el-button>
        </template>
        </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
        <Pagination />
    </div>
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
    margin-top: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;

  /* 調整滑過行時的背景色 */
    :deep(.el-table__row:hover > td) {
        background-color: #f9fbfb !important;
    }
}

.pagination-wrapper {
    margin-top: 30px;
    display: flex;
    justify-content: center;
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