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
const activeMainTab = ref('volunteer')
const activeDonationTab = ref('single')

// 會員基本資料
const memberData = ref({
    MEMBER_ID: null,
    MEMBER_REALNAME: '',
    MEMBER_EMAIL: '',
    MEMBER_PHONE: '',
    NICKNAME: '',
    MEMBER_ACTIVE: 1
})

const totalVolunteerHours = ref(0)
const volunteerRecords = ref([])
const singleDonations = ref([])
const regularDonation = ref({
    id: '',
    status: '',
    amount: 0,
    cycle: '每月',
    lastDate: '',
    nextDate: '-',
    history: []
})

const loading = ref(false)

// 1. 獲取會員詳情
const fetchMemberDetail = async () => {
    loading.value = true
    try {
        const response = await memberAPI.getDetail(route.params.id)
        memberData.value = response.item
    } catch (error) {
        ElMessage.error('獲取會員資料失敗: ' + error.message)
        router.back()
    } finally {
        loading.value = false
    }
}

// 2. 獲取志工紀錄
const fetchVolunteerData = async () => {
    try {
        const res = await memberAPI.getVolunteers(route.params.id)
        if (res.status === 'success') {
            totalVolunteerHours.value = res.total_accumulated_hours || 0
            volunteerRecords.value = (res.activity_history || []).map(item => ({
                title: item.ACTIVITY_NAME,
                date: formatDate(item.ACTIVITY_DATE),
                location: '活動現場',
                hours: item.ACTIVITY_HOURS
            }))
        }
    } catch (err) {
        console.error('獲取志工紀錄失敗:', err)
    }
}

// 3. 獲取捐款紀錄 (對齊 TRANSACTION_ID)
const fetchDonationData = async () => {
    try {
        const res = await memberAPI.getDonations(route.params.id)
        if (res.status === 'success') {
            const raw = res.data || []
            
            // 單筆捐款
            singleDonations.value = raw
                .filter(d => d.DONATION_TYPE === '單次捐款')
                .map(d => ({
                    id: d.TRANSACTION_ID,
                    type: d.PAYMENT_METHOD,
                    donor: memberData.value.MEMBER_REALNAME,
                    date: formatDate(d.DONATION_DATE),
                    amount: d.AMOUNT
                }))

            // 定期定額 (尋找有 SUBSCRIPTION_ID 的紀錄)
            const sub = raw.find(d => d.DONATION_TYPE === '定期定額' || d.SUBSCRIPTION_ID)
            if (sub) {
                regularDonation.value.id = sub.SUBSCRIPTION_ID || 'SUB-' + sub.TRANSACTION_ID
                regularDonation.value.status = '進行中'
                regularDonation.value.amount = sub.AMOUNT
                regularDonation.value.lastDate = formatDate(sub.DONATION_DATE)
                regularDonation.value.history = raw
                    .filter(d => d.SUBSCRIPTION_ID === sub.SUBSCRIPTION_ID)
                    .map(h => ({
                        month: h.DONATION_DATE.substring(0, 7),
                        amount: h.AMOUNT,
                        date: formatDate(h.DONATION_DATE),
                        status: '成功'
                    }))
            }
        }
    } catch (err) {
        console.error('獲取捐款紀錄失敗:', err)
    }
}

onMounted(async () => {
    await fetchMemberDetail()
    fetchVolunteerData()
    fetchDonationData()
})

const statusText = (s) => s === 1 ? '啟用' : '停用'
</script>

<template>
    <div class="pageContainer">
        <AdminHeader title="會員詳情" />

        <section class="info-section" v-loading="loading">
            <div class="info-list">
                <div class="info-item"><span class="label">姓名</span><span class="value">{{ memberData.MEMBER_REALNAME }}</span></div>
                <div class="info-item"><span class="label">暱稱</span><span class="value">{{ memberData.NICKNAME || '-' }}</span></div>
                <div class="info-item"><span class="label">E-MAIL</span><span class="value email">{{ memberData.MEMBER_EMAIL }}</span></div>
                <div class="info-item"><span class="label">手機</span><span class="value">{{ memberData.MEMBER_PHONE || '-' }}</span></div>
                <div class="info-item"><span class="label">狀態</span><span class="value">{{ statusText(memberData.MEMBER_ACTIVE) }}</span></div>
            </div>
        </section>

        <div class="section-divider"></div>

        <el-tabs v-model="activeMainTab" class="member-detail-tabs">
            <el-tab-pane label="志工時數" name="volunteer">
                <div class="tab-inner">
                    <p class="summary-title">累積時數：{{ totalVolunteerHours }} 小時</p>
                    <div v-if="volunteerRecords.length === 0" class="empty">尚無志工紀錄</div>
                    <div v-for="(record, i) in volunteerRecords" :key="i" class="record-card">
                        <div class="card-info">
                            <h3>{{ record.title }}</h3>
                            <p>日期：{{ record.date }}</p>
                        </div>
                        <div class="card-status">{{ record.hours }} 小時</div>
                    </div>
                </div>
            </el-tab-pane>

            <el-tab-pane label="捐款紀錄" name="donation">
                <div class="tab-inner">
                    <el-tabs v-model="activeDonationTab" class="sub-record-tabs">
                        <el-tab-pane label="單筆捐款" name="single">
                            <div v-if="singleDonations.length === 0" class="empty">尚無紀錄</div>
                            <div v-for="item in singleDonations" :key="item.id" class="record-card donation-card">
                                <p>編號：{{ item.id }} | 金額：${{ item.amount.toLocaleString() }}</p>
                                <p>日期：{{ item.date }} | 方式：{{ item.type }}</p>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="定期定額" name="regular">
                            <div v-if="!regularDonation.id" class="empty">尚無紀錄</div>
                            <div v-else class="regular-info-header">
                                <p>計畫編號：{{ regularDonation.id }}</p>
                                <p>每期金額：${{ regularDonation.amount.toLocaleString() }}</p>
                                <div v-for="(log, idx) in regularDonation.history" :key="idx" class="record-card donation-card">
                                    <p>{{ log.month }} 扣款：${{ log.amount }} ({{ log.date }})</p>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/base/_var.scss';
.pageContainer { padding: 40px; background: #fff; min-height: 100vh; }
.info-section { margin: 30px 0; .info-list { display: flex; flex-direction: column; gap: 12px; .info-item { display: flex; .label { width: 140px; font-weight: bold; color: $text-color; } .value.email { color: $primary-color; text-decoration: underline; } } } }
.section-divider { width: 100%; height: 2px; background: $primary-color; margin: 40px 0; opacity: 0.3; }
:deep(.el-tabs__item) { font-size: 20px; font-weight: bold; &.is-active { color: $primary-color; } }
:deep(.el-tabs__active-bar) { background: $primary-color; height: 4px; }
.tab-inner { padding: 20px 0; .summary-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; } .empty { text-align: center; color: #999; padding: 40px; } }
.record-card { border-bottom: 1.5px solid rgba($primary-color, 0.2); padding: 20px 0; display: flex; justify-content: space-between; align-items: center; &.donation-card { display: block; p { margin: 5px 0; font-size: 14px; } } }
</style>