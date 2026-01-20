<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const sortBy = ref('')
const filterType = ref('')
const filterPayment = ref('')
const searchQuery = ref('')

const tableData = [
    {
        id: '01',
        date: '2026/01/19\n14:30:22',
        email: 'turtle_lover@example.com',
        transactionId: 'ECP202601190001',
        category: '定期定額',
        amount: '1,200',
        status: '綠界(信用卡)',
    },
    {
        id: '02',
        date: '2026/01/18\n09:15:00',
        email: 'ocean_guard@gmail.com',
        transactionId: 'LP773021958',
        category: '單筆捐款',
        amount: '5,000',
        status: 'LINE Pay',
    },
    {
        id: '03',
        date: '2026/01/15\n18:22:10',
        email: 'green_sea@yahoo.com.tw',
        transactionId: 'ECP202601150042',
        category: '定期定額',
        amount: '500',
        status: '綠界(信用卡)',
    },
    {
        id: '04',
        date: '2026/01/12\n11:05:45',
        email: 'save_turtles@outlook.com',
        transactionId: 'LP334901221',
        category: '單筆捐款',
        amount: '2,000',
        status: 'LINE Pay',
    },
    {
        id: '05',
        date: '2026/01/10\n13:40:12',
        email: 'helper123@gmail.com',
        transactionId: 'ECP202601100088',
        category: '單筆捐款',
        amount: '1,000',
        status: '綠界(信用卡)',
    },
    {
        id: '06',
        date: '2026/01/08\n16:55:30',
        email: 'island_life@example.com',
        transactionId: 'LP556677889',
        category: '定期定額',
        amount: '300',
        status: 'LINE Pay',
    }
]
</script>

<template>
    <div class="pageContainer">
        <div class="headerSection">
            <h2 class="pageTitle">捐款管理</h2>
            <div class="userInfo">
                <span>管理者帳號</span>
                <el-button size="small" plain>登出</el-button>
            </div>
        </div>

        <div class="toolbarSection">
            <div class="filters">
                <el-select v-model="sortBy" placeholder="排序" style="width: 120px; margin-right: 12px;">
                    <el-option label="最新捐款" value="newest" />
                    <el-option label="最早捐款" value="oldest" />
                </el-select>
                <el-select v-model="filterType" placeholder="類型篩選" style="width: 120px; margin-right: 12px;">
                    <el-option label="定期定額" value="recurring" />
                    <el-option label="單筆捐款" value="once" />
                </el-select>
                <el-select v-model="filterPayment" placeholder="金流篩選" style="width: 140px; margin-right: 12px;">
                    <el-option label="綠界(信用卡)" value="ecpay" />
                    <el-option label="LINE Pay" value="line_pay" />
                </el-select>

                <el-input v-model="searchQuery" placeholder="搜尋" style="width: 220px">
                    <template #suffix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
            </div>

            <el-button type="primary" plain class="addBtn">新增資料</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" class="customTable" header-row-class-name="tableHeader">
            <el-table-column prop="id" label="捐款編號" width="100" align="center" />
            
            <el-table-column prop="date" label="捐款時間" width="160" align="center">
                <template #default="scope">
                    <div style="white-space: pre-line">{{ scope.row.date }}</div>
                </template>
            </el-table-column>

            <el-table-column prop="email" label="會員信箱" min-width="200" align="center" />

            <el-table-column prop="transactionId" label="交易編號" min-width="180" align="center" />

            <el-table-column prop="category" label="類型" width="120" align="center" />

            <el-table-column prop="amount" label="捐款金額" width="120" align="center">
                <template #default="scope">
                    <span>$ {{ scope.row.amount }}</span>
                </template>
            </el-table-column>

            <el-table-column prop="status" label="金流類型" width="140" align="center" />
        </el-table>

        <div class="paginationSection">
            <el-pagination background layout="prev, pager, next" :total="50" class="mt-4" />
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