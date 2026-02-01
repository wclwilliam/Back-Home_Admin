<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminHeader from '@/components/AdminHeader.vue'
import { memberAPI } from '@/utils/adminApi'
import { formatDate } from '@/utils/formatTime'

const route = useRoute()
const router = useRouter()

// Tab 狀態控制
const activeMainTab = ref('volunteer') // 主頁籤：志工時數 | 捐款紀錄
const activeDonationTab = ref('single') // 捐款子頁籤：單筆捐款 | 定期定額

// 會員基本資料
const memberData = ref({
    MEMBER_ID: null,
    MEMBER_REALNAME: '',
    MEMBER_EMAIL: '',
    MEMBER_PHONE: '',
    ID_NUMBER: '',
    BIRTHDAY: '',
    EMERGENCY: '',
    EMERGENCY_TEL: '',
    EMAIL_VERIFIED_AT: '',
    MEMBER_ACTIVE: 1,
    MEMBER_CREATED_AT: '',
})

// 志工時數相關（待後續串接 API）
const totalVolunteerHours = ref(0)
const volunteerRecords = ref([])

// 單筆捐款相關（待後續串接 API）
const singleDonations = ref([])

// 定期定額相關（待後續串接 API）
const regularDonation = ref({
    id: '',
    type: '',
    status: '',
    amount: 0,
    cycle: '',
    lastDate: '',
    nextDate: '',
    history: []
})

const loading = ref(false)

// 獲取會員詳情
const fetchMemberDetail = async () => {
    loading.value = true
    try {
        const response = await memberAPI.getDetail(route.params.id)
        memberData.value = response.item
    } catch (error) {
        ElMessage.error(error.message || '獲取會員資料失敗')
        router.back()
    } finally {
        loading.value = false
    }
}

// 格式化狀態顯示
const statusText = (status) => {
    return status === 1 ? '啟用' : '停用'
}

onMounted(() => {
    fetchMemberDetail()
})
</script>

<template>
    <div class="pageContainer">
        <AdminHeader title="會員資料" />

        <section class="info-section" v-loading="loading">
            <div class="info-list">
                <div class="info-item"><span class="label">姓名</span><span class="value">{{ memberData.MEMBER_REALNAME
                        }}</span></div>
                <div class="info-item"><span class="label">暱稱</span><span class="value">{{ memberData.NICKNAME || '-'
                        }}</span></div>
                <div class="info-item"><span class="label">E-MAIL</span><span class="value email">{{
                        memberData.MEMBER_EMAIL }}</span></div>
                <div class="info-item"><span class="label">手機號碼</span><span class="value">{{ memberData.MEMBER_PHONE ||
                        '-' }}</span></div>
                <div class="info-item"><span class="label">帳號狀態</span><span class="value">{{
                    statusText(memberData.MEMBER_ACTIVE) }}</span></div>
            </div>
        </section>

        <div class="section-divider"></div>

        <el-tabs v-model="activeMainTab" class="member-detail-tabs">

            <el-tab-pane label="志工時數" name="volunteer">
                <div class="tab-inner">
                    <p class="summary-title">志工時數已累積：{{ totalVolunteerHours }}小時</p>

                    <div v-if="volunteerRecords.length === 0" style="text-align: center; color: #999; padding: 40px;">
                        尚無志工時數紀錄
                    </div>

                    <div v-for="record in volunteerRecords" :key="record.id" class="record-card">
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
                            <div v-if="singleDonations.length === 0"
                                style="text-align: center; color: #999; padding: 40px;">
                                尚無單筆捐款紀錄
                            </div>

                            <div v-for="(item, index) in singleDonations" :key="index"
                                class="record-card donation-card">
                                <p>捐款編號：{{ item.id }}</p>
                                <p>金流類型：{{ item.type }}</p>
                                <p>捐款人：{{ item.donor }}</p>
                                <p>捐款日期：{{ item.date }}</p>
                                <p>捐款金額：${{ item.amount }}</p>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="定期定額" name="regular">
                            <div v-if="!regularDonation.id" style="text-align: center; color: #999; padding: 40px;">
                                尚無定期定額紀錄
                            </div>

                            <template v-else>
                                <div class="regular-info-header">
                                    <p>定期定額編號：{{ regularDonation.id }}</p>
                                    <p>狀態：<span class="highlight-status">{{ regularDonation.status }}</span></p>
                                    <p>每期金額：${{ regularDonation.amount }}</p>
                                    <p>扣款週期：{{ regularDonation.cycle }}</p>
                                    <p>最近扣款日：{{ regularDonation.lastDate }}</p>
                                    <p>下次扣款日：{{ regularDonation.nextDate }}</p>
                                </div>

                                <div v-for="(log, idx) in regularDonation.history" :key="idx"
                                    class="record-card donation-card">
                                    <p>扣款月份：{{ log.month }}</p>
                                    <p>扣款金額：${{ log.amount }}</p>
                                    <p>扣款日期：{{ log.date }}</p>
                                    <p>狀態：{{ log.status }}</p>
                                </div>
                            </template>
                        </el-tab-pane>

                    </el-tabs>
                </div>
            </el-tab-pane>
        </el-tabs>

        <div class="pagination-container">
            <el-pagination layout="pager" :total="50" :page-size="10" class="custom-pager" />
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