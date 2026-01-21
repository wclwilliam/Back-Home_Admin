<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'

const route = useRoute()

// Tab 狀態控制
const activeMainTab = ref('volunteer') // 主頁籤：志工時數 | 捐款紀錄
const activeDonationTab = ref('single') // 捐款子頁籤：單筆捐款 | 定期定額

// 模擬 API 一次性抓取的資料結構 (待後續對接)
const memberData = ref({
    name: '王曉明',
    nickname: '小明',
    email: '123go!@gmail.com',
    phone: '0957634987',
    status: '可用', 
    totalVolunteerHours: 36,
  // 志工時數清單
    volunteerRecords: [
    { id: 1, title: 'xxx淨灘活動', date: '2025.12.29', location: '萬里翡翠灣', hours: 6 },
    { id: 2, title: 'xxx淨灘活動', date: '2025.12.29', location: '萬里翡翠灣', hours: 6 },
    { id: 3, title: 'xxx淨灘活動', date: '2025.12.29', location: '萬里翡翠灣', hours: 6 },
    { id: 4, title: 'xxx淨灘活動', date: '2025.12.29', location: '萬里翡翠灣', hours: 6 },
    ],
  // 單筆捐款清單
    singleDonations: [
    { id: '123456', type: '信用卡', donor: '王曉明', date: '2025.12.29', amount: 2000 },
    { id: '123456', type: '信用卡', donor: '王曉明', date: '2025.12.29', amount: 2000 },
    { id: '123456', type: '信用卡', donor: '王曉明', date: '2025.12.29', amount: 2000 },
    ],
  // 定期定額資料
    regularDonation: {
    id: '123456',
    type: '信用卡',
    status: '進行中',
    amount: 2000,
    cycle: '每月',
    lastDate: '2025.12.29 (扣款成功)',
    nextDate: '2026.01.29',
    history: [
        { month: '12月', amount: 2000, date: '2025.12.29', status: '成功' },
        { month: '12月', amount: 2000, date: '2025.12.29', status: '成功' },
        { month: '12月', amount: 2000, date: '2025.12.29', status: '成功' },
        ]
    }
})

onMounted(() => {
  // 未來可以在此根據 route.params.id 呼叫 API
    console.log('正在查看會員 ID:', route.params.id)
})
</script>

<template>
    <div class="pageContainer">
    <AdminHeader title="會員資料" />

    <section class="info-section">
        <div class="info-list">
        <div class="info-item"><span class="label">姓名</span><span class="value">{{ memberData.name }}</span></div>
        <div class="info-item"><span class="label">暱稱</span><span class="value">{{ memberData.nickname }}</span></div>
        <div class="info-item"><span class="label">E-MAIL</span><span class="value email">{{ memberData.email }}</span></div>
        <div class="info-item"><span class="label">手機號碼</span><span class="value">{{ memberData.phone }}</span></div>
        <div class="info-item"><span class="label">帳號狀態</span><span class="value">{{ memberData.status }}</span></div>
        </div>
    </section>

    <div class="section-divider"></div>

    <el-tabs v-model="activeMainTab" class="member-detail-tabs">

        <el-tab-pane label="志工時數" name="volunteer">
            <div class="tab-inner">
            <p class="summary-title">志工時數已累積：{{ memberData.totalVolunteerHours }}小時</p>
            
            <div v-for="record in memberData.volunteerRecords" :key="record.id" class="record-card">
                <div class="card-info">
                <h3>{{ record.title }}</h3>
                <p>活動日期：{{ record.date }}</p>
                <p>活動地點：{{ record.location }}</p>
            </div>
            <div class="card-status">
                志工時數：{{ record.hours }}小時
                </div>
            </div>
            </div>
        </el-tab-pane>

        <el-tab-pane label="捐款紀錄" name="donation">
        <div class="tab-inner">
            <el-tabs v-model="activeDonationTab" class="sub-record-tabs">
                
                <el-tab-pane label="單筆捐款" name="single">
                <div v-for="(item, index) in memberData.singleDonations" :key="index" class="record-card donation-card">
                <p>捐款編號：{{ item.id }}</p>
                <p>金流類型：{{ item.type }}</p>
                <p>捐款人：{{ item.donor }}</p>
                <p>捐款日期：{{ item.date }}</p>
                <p>捐款金額：${{ item.amount }}</p>
                </div>
            </el-tab-pane>

            <el-tab-pane label="定期定額" name="regular">
                <div class="regular-info-header">
                <p>定期定額編號：{{ memberData.regularDonation.id }}</p>
                <p>狀態：<span class="highlight-status">{{ memberData.regularDonation.status }}</span></p>
                <p>每期金額：${{ memberData.regularDonation.amount }}</p>
                <p>扣款週期：{{ memberData.regularDonation.cycle }}</p>
                <p>最近扣款日：{{ memberData.regularDonation.lastDate }}</p>
                <p>下次扣款日：{{ memberData.regularDonation.nextDate }}</p>
                </div>
                
                <div v-for="(log, idx) in memberData.regularDonation.history" :key="idx" class="record-card donation-card">
                <p>扣款月份：{{ log.month }}</p>
                <p>扣款金額：${{ log.amount }}</p>
                <p>扣款日期：{{ log.date }}</p>
                <p>狀態：{{ log.status }}</p>
                </div>
                </el-tab-pane>

            </el-tabs>
            </div>
        </el-tab-pane>
    </el-tabs>

    <div class="pagination-container">
        <el-pagination 
            layout="pager" 
            :total="50" 
            :page-size="10" 
            class="custom-pager"
        />
    </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/base/_var.scss';

.pageContainer {
    padding: 40px;
    background-color: #fff;
    min-height: 100vh;
}

/* 基本資料樣式 */
.info-section {
    margin: 30px 0;
    .info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    .info-item {
        display: flex;
        font-size: 16px;
        .label {
        width: 140px;
        font-weight: bold;
        color: $text-color;
        }
        .value {
        color: #555;
        &.email {
            text-decoration: underline;
            color: $primary-color;
        }
        }
        }
    }
}

.section-divider {
    width: 100%;
    height: 2px;
    background-color: $primary-color;
    margin: 40px 0;
    opacity: 0.3;
}

/* Tabs 核心樣式 */
:deep(.el-tabs__item) {
    font-size: 24px;
    font-weight: bold;
    color: #999;
    &.is-active {
    color: $primary-color;
    }
}
:deep(.el-tabs__active-bar) {
    background-color: $primary-color;
    height: 4px;
}
:deep(.el-tabs__nav-wrap::after) {
  display: none; // 去掉底部灰線
}

/* 子 Tabs 樣式 */
.sub-record-tabs {
    margin-top: 20px;
    :deep(.el-tabs__item) {
        font-size: 18px;
    }
}

.tab-inner {
    padding: 20px 0;
    text-align: left;
    .summary-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 30px;
    }
}

/* 清單卡片樣式 (橫跨全寬且帶底線) */
.record-card {
    border-bottom: 1.5px solid rgba($primary-color, 0.5);
    padding: 25px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: $text-color;
    }
    p {
        font-size: 14px;
        color: #666;
        margin: 4px 0;
    }
    .card-status {
        font-weight: bold;
        color: $text-color;
    }

    &.donation-card {
        display: block; // 捐款模式為直列排布
        p {
        font-size: 15px;
        margin: 8px 0;
        }
    }
    }

    /* 定期定額資訊塊 */
    .regular-info-header {
    line-height: 2;
    margin-bottom: 15px;
    font-size: 15px;
    .highlight-status {
        color: #2d8c8c;
        font-weight: bold;
    }
    }

    /* 分頁器樣式 */
    .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 60px;
    
    :deep(.el-pager li) {
        background: transparent;
        font-size: 18px;
        color: #999;
        &.is-active {
        color: #333;
        text-decoration: underline;
        font-weight: bold;
        }
    }
    }
</style>