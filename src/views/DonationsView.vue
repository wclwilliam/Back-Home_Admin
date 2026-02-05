<script setup>
import { ref, computed,onMounted, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import AdminHeader from '@/components/AdminHeader.vue'
import Pagination from '@/components/Pagination.vue'
import { backHomeApi } from '@/utils/publicApi'
import router from '@/router'

// --- 響應式狀態 ---
const rawData = ref([]) // 1. 初始化為空陣列
const sortBy = ref('newest')
const filterType = ref('')
const filterPayment = ref('')
const searchQuery = ref('')
const currentPage = ref(1)

// 死數據
// const rawData = [

//   { id: '01', date: '2026/01/19\n14:30:22', email: 'turtle_lover@example.com', transactionId: 'ECP202601190001', category: '定期定額', amount: '1,200', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '02', date: '2026/01/18\n09:15:00', email: 'ocean_guard@gmail.com', transactionId: 'LP773021958', category: '單次捐款', amount: '5,000', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '03', date: '2026/01/15\n18:22:10', email: 'green_sea@yahoo.com.tw', transactionId: 'ECP202601150042', category: '定期定額', amount: '500', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '04', date: '2026/01/12\n11:05:45', email: 'save_turtles@outlook.com', transactionId: 'LP334901221', category: '單次捐款', amount: '2,000', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '05', date: '2026/01/10\n13:40:12', email: 'helper123@gmail.com', transactionId: 'ECP202601100088', category: '單次捐款', amount: '1,000', status: '信用卡', typeKey: 'once', payKey: 'ecpay' },

//   { id: '06', date: '2026/01/08\n16:55:30', email: 'island_life@example.com', transactionId: 'LP556677889', category: '定期定額', amount: '300', status: 'LINE Pay', typeKey: 'recurring', payKey: 'line_pay' },

//   { id: '07', date: '2026/01/05\n10:20:00', email: 'blue_whale@whale.org', transactionId: 'ECP202601050012', category: '單次捐款', amount: '10,000', status: '信用卡', typeKey: 'once', payKey: 'ecpay' },

//   { id: '08', date: '2026/01/04\n22:10:45', email: 'coral_reef@marine.com', transactionId: 'LP998811223', category: '定期定額', amount: '1,500', status: 'LINE Pay', typeKey: 'recurring', payKey: 'line_pay' },

//   { id: '09', date: '2026/01/03\n08:05:12', email: 'eco_warrior@test.com', transactionId: 'ECP202601030999', category: '單次捐款', amount: '2,500', status: '信用卡', typeKey: 'once', payKey: 'ecpay' },

//   { id: '10', date: '2026/01/01\n12:00:00', email: 'happy_donor@charity.tw', transactionId: 'LP112233445', category: '定期定額', amount: '800', status: 'LINE Pay', typeKey: 'recurring', payKey: 'line_pay' },

//   { id: '11', date: '2025/12/28\n15:30:00', email: 'summer_beach@sun.com', transactionId: 'ECP202512280015', category: '單次捐款', amount: '3,000', status: '信用卡', typeKey: 'once', payKey: 'ecpay' },

//   { id: '12', date: '2025/12/25\n09:00:00', email: 'xmas_gift@giving.com', transactionId: 'LP667788990', category: '單次捐款', amount: '6,600', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '13', date: '2025/12/20\n17:45:20', email: 'wave_rider@surf.com', transactionId: 'ECP202512200888', category: '定期定額', amount: '450', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '14', date: '2025/12/15\n11:22:33', email: 'deep_sea@ocean.net', transactionId: 'LP445566778', category: '定期定額', amount: '2,200', status: 'LINE Pay', typeKey: 'recurring', payKey: 'line_pay' },

//   { id: '15', date: '2025/12/10\n14:10:05', email: 'plastic_free@green.com', transactionId: 'ECP202512100555', category: '單次捐款', amount: '1,800', status: '信用卡', typeKey: 'once', payKey: 'ecpay' },

//   { id: '16', date: '2025/12/05\n10:30:00', email: 'member_99@test.com', transactionId: 'LP102938475', category: '單次捐款', amount: '100', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '17', date: '2025/12/01\n08:15:22', email: 'world_peace@charity.org', transactionId: 'ECP202512010001', category: '定期定額', amount: '3,000', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '18', date: '2025/11/28\n19:22:11', email: 'sea_shell@beach.tw', transactionId: 'LP554433221', category: '單次捐款', amount: '1,200', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '19', date: '2025/11/25\n13:40:00', email: 'mountain_high@nature.com', transactionId: 'ECP202511250987', category: '定期定額', amount: '600', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '20', date: '2025/11/20\n11:05:55', email: 'forest_run@green.net', transactionId: 'LP121212121', category: '單次捐款', amount: '8,000', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '21', date: '2025/11/15\n09:30:00', email: 'animal_care@pet.com', transactionId: 'ECP202511150022', category: '定期定額', amount: '1,000', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '22', date: '2025/11/12\n16:20:10', email: 'clean_air@future.tw', transactionId: 'LP909080807', category: '單次捐款', amount: '2,500', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '23', date: '2025/11/10\n14:00:00', email: 'starry_night@sky.com', transactionId: 'ECP202511100333', category: '定期定額', amount: '500', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '24', date: '2025/11/05\n10:45:00', email: 'rainy_day@weather.org', transactionId: 'LP776655443', category: '單次捐款', amount: '150', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '25', date: '2025/11/01\n08:55:22', email: 'coffee_lover@cafe.com', transactionId: 'ECP202511010055', category: '定期定額', amount: '2,000', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '26', date: '2025/10/28\n21:10:00', email: 'book_worm@library.net', transactionId: 'LP135724680', category: '單次捐款', amount: '3,500', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '27', date: '2025/10/25\n12:30:45', email: 'music_fan@concert.tw', transactionId: 'ECP202510250666', category: '定期定額', amount: '1,200', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '28', date: '2025/10/20\n15:20:00', email: 'art_gallery@creative.com', transactionId: 'LP246813579', category: '單次捐款', amount: '12,000', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '29', date: '2025/10/15\n09:10:12', email: 'runner_01@sport.org', transactionId: 'ECP202510150999', category: '定期定額', amount: '880', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '30', date: '2025/10/10\n18:45:30', email: 'cyclist@bike.tw', transactionId: 'LP111222333', category: '單次捐款', amount: '4,200', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '31', date: '2025/10/05\n11:30:00', email: 'diver_pro@ocean.com', transactionId: 'ECP202510050123', category: '定期定額', amount: '1,500', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '32', date: '2025/10/01\n14:20:55', email: 'chef_mario@food.net', transactionId: 'LP999888777', category: '單次捐款', amount: '700', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '33', date: '2025/09/25\n08:50:00', email: 'travel_bug@world.tw', transactionId: 'ECP202509250555', category: '定期定額', amount: '2,500', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '34', date: '2025/09/20\n10:10:10', email: 'photo_man@camera.com', transactionId: 'LP444555666', category: '單次捐款', amount: '3,000', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '35', date: '2025/09/15\n16:40:22', email: 'game_player@esport.tw', transactionId: 'ECP202509150777', category: '定期定額', amount: '1,000', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '36', date: '2025/09/10\n13:15:00', email: 'movie_fan@cinema.com', transactionId: 'LP123123123', category: '單次捐款', amount: '500', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '37', date: '2025/09/05\n09:22:11', email: 'pet_owner@home.net', transactionId: 'ECP202509050011', category: '定期定額', amount: '200', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '38', date: '2025/09/01\n22:05:00', email: 'night_owl@sleepy.tw', transactionId: 'LP321321321', category: '單次捐款', amount: '1,800', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '39', date: '2025/08/25\n11:45:30', email: 'history_buff@past.org', transactionId: 'ECP202508250888', category: '定期定額', amount: '1,200', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '40', date: '2025/08/20\n15:10:00', email: 'science_geek@lab.com', transactionId: 'LP654654654', category: '單次捐款', amount: '9,000', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '41', date: '2025/08/15\n08:30:22', email: 'peace_maker@union.tw', transactionId: 'ECP202508150111', category: '定期定額', amount: '500', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '42', date: '2025/08/10\n12:20:00', email: 'earth_first@green.org', transactionId: 'LP789789789', category: '單次捐款', amount: '2,200', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '43', date: '2025/08/05\n10:05:15', email: 'sunny_smile@joy.com', transactionId: 'ECP202508050444', category: '定期定額', amount: '3,000', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '44', date: '2025/08/01\n14:55:00', email: 'river_flow@water.net', transactionId: 'LP147258369', category: '單次捐款', amount: '1,500', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '45', date: '2025/07/25\n09:40:22', email: 'sky_high@flight.tw', transactionId: 'ECP202507250222', category: '定期定額', amount: '1,000', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '46', date: '2025/07/20\n17:30:00', email: 'tree_planter@earth.com', transactionId: 'LP369258147', category: '單次捐款', amount: '4,500', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '47', date: '2025/07/15\n11:15:10', email: 'save_energy@power.org', transactionId: 'ECP202507150999', category: '定期定額', amount: '600', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '48', date: '2025/07/10\n13:00:00', email: 'zero_waste@recycle.tw', transactionId: 'LP258147369', category: '單次捐款', amount: '300', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '49', date: '2025/07/05\n08:20:55', email: 'clean_ocean@blue.com', transactionId: 'ECP202507050333', category: '定期定額', amount: '2,500', status: '信用卡', typeKey: 'recurring', payKey: 'ecpay' },

//   { id: '50', date: '2025/07/01\n15:45:00', email: 'last_donor@finish.net', transactionId: 'LP987654321', category: '單次捐款', amount: '10,000', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

//   { id: '51', date: '2025/07/01\n15:45:00', email: 'last_donor@finish.net', transactionId: 'LP987654321', category: '單次捐款', amount: '10,000', status: 'LINE Pay', typeKey: 'once', payKey: 'line_pay' },

// ];

// 2. 拿資料庫數據
onMounted(async () => {
  try {
    const res = await backHomeApi.get("donation/donation_get.php")
    // 確保 res.data 是陣列，直接賦值給 rawData.value
    rawData.value = res.data 
    console.log(res.data);
    
  } catch (error) {
    console.error("獲取資料失敗:", error)
  }
})



// 1. 先計算「過濾與排序後」的所有數據
const filteredData = computed(() => {
    let result = [...rawData.value]

    // --- A. 過濾邏輯---
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(item => 
            item.member_email.toLowerCase().includes(query) || 
            item.TRANSACTION_ID.toLowerCase().includes(query)
        )
    }

    if (filterType.value) {
        result = result.filter(item => item.DONATION_TYPE === filterType.value)
    }

    if (filterPayment.value) {
        result = result.filter(item => item.PAYMENT_METHOD === filterPayment.value)
    }

    // --- B. 擴充排序邏輯 ---
    result.sort((a, b) => {
        switch (sortBy.value) {
            case 'newest': { // 時間：新 → 舊
                return new Date(b.DONATION_DATE.replace('\n', ' ')) - new Date(a.DONATION_DATE.replace('\n', ' '))
            }
            case 'oldest': { // 時間：舊 → 新
                return new Date(a.DONATION_DATE.replace('\n', ' ')) - new Date(b.DONATION_DATE.replace('\n', ' '))
            }
            case 'lgMoney': { // 金額：高 → 低
                // 先去掉逗號，轉成數字再比較
                
                const valA = parseFloat(a.AMOUNT)
                const valB = parseFloat(b.AMOUNT)
                return valB - valA
            }
            case 'smMoney': { // 金額：低 → 高
                const valA = parseFloat(a.AMOUNT)
                const valB = parseFloat(b.AMOUNT)
                return valA - valB
            }
            case 'lgNumber': { // 編號：大 → 小 (id 是字串 "01"，轉數字比較)
                return parseInt(b.DONATION_ID) - parseInt(a.DONATION_ID)
            }
            case 'smNumber': { // 編號：小 → 大
                return parseInt(a.DONATION_ID) - parseInt(b.DONATION_ID)
            }
            default:
                return 0
        }
    })

    // 當篩選條件改變時，強制回到第一頁
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    currentPage.value = 1 

    return result
})

// 2. 最終顯示在表格中的「當前頁面數據」
const displayData = computed(() => {
    const start = (currentPage.value - 1) * 10
    const end = start + 10
    return filteredData.value.slice(start, end)
})

const goMember = (memberId,donationType) =>{
    // console.log(memberId);
    router.push({
    name: "admin-members-detail",
    params: {
        id: memberId
    },
    query: {  //會員頁面要接query參數
      tab: 'donation',
      sub: donationType   
    }
  });
    
}
</script>

<template>
    <div class="pageContainer">
        <AdminHeader title="捐款管理" />

        <div class="toolbarSection">
            <div class="filters">
                <el-select v-model="sortBy" placeholder="排序" style="width: 180px; margin-right: 12px;">
                    <el-option label="捐款時間（新 → 舊）" value="newest" />
                    <el-option label="捐款時間（舊 → 新）" value="oldest" />
                    <el-option label="捐款金額（高 → 低）" value="lgMoney" />
                    <el-option label="捐款金額（低 → 高）" value="smMoney" />
                    <el-option label="捐款編號（大 → 小）" value="lgNumber" />
                    <el-option label="捐款編號（小 → 大）" value="smNumber" />
                </el-select>
                <el-select v-model="filterType" placeholder="類型篩選" style="width: 120px; margin-right: 12px;">
                    <el-option label="全部" value="" />
                    <el-option label="定期定額" value="定期定額" />
                    <el-option label="單次捐款" value="單次捐款" />
                </el-select>
                <el-select v-model="filterPayment" placeholder="金流篩選" style="width: 140px; margin-right: 12px;">
                    <el-option label="全部" value="" />
                    <el-option label="信用卡" value="信用卡" />
                    <el-option label="LINE Pay" value="LINE_Pay" />
                </el-select>

                <el-input v-model="searchQuery" placeholder="搜尋" style="width: 220px">
                    <template #suffix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
            </div>
        </div>

        <el-table :data="displayData" style="width: 100%" class="customTable" header-row-class-name="tableHeader">
            <el-table-column prop="DONATION_ID" label="捐款編號" width="100" align="center" />
            
            <el-table-column prop="DONATION_DATE" label="捐款時間" width="160" align="center">
                <template #default="scope"><!--  作用域slot -->
                    <div style="white-space: pre-line">{{ scope.row.DONATION_DATE }}</div>
                </template>
            </el-table-column>

            <el-table-column prop="member_email" label="會員信箱" min-width="200" align="center" >
                <template #default="scope">
                    <span 
                    @click="goMember(scope.row.MEMBER_ID,scope.row.DONATION_TYPE)"
                    style="cursor: pointer; text-decoration: underline;"
                    >{{ scope.row.member_email }}</span>
                </template>
            </el-table-column>

            <el-table-column prop="TRANSACTION_ID" label="交易編號" min-width="180" align="center" />

            <el-table-column prop="DONATION_TYPE" label="類型" width="120" align="center" />

            <el-table-column prop="AMOUNT" label="捐款金額" width="120" align="center">
                <template #default="scope">
                    <span>$ {{ scope.row.AMOUNT }}</span>
                </template>
            </el-table-column>

            <el-table-column prop="PAYMENT_METHOD" label="金流類型" width="140" align="center" />
        </el-table>

        <!-- <div class="paginationSection">
            <el-pagination 
                background 
                layout="prev, pager, next" 
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="filteredData.length" 
                class="mt-4" 
            />
        </div> -->
        <Pagination 
            v-model:current-page="currentPage"
            :total="filteredData.length"
        />
    </div>
</template>
<style scoped lang="scss">
.pageContainer {
padding: 30px; 
  min-height: 100vh;
  box-sizing: border-box;
}

//工具列 
.toolbarSection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;

  :deep(.el-input) {
    --el-input-border-color: #0E6273;
    --el-input-focus-border-color: #0E6273;
    --el-input-hover-border-color: #0E6273; 
  }

  :deep(.el-select) {
    --el-border-color: #0E6273; 
    --el-border-color-hover: #0E6273;
    --el-color-primary: #0E6273; 
    --el-select-input-focus-border-color: #0E6273;
  }
}

.customTable {
  :deep(th.el-table__cell) {
    background-color: $card-color ; 
    font-size: 14px;
    color: $text-color;
    font-weight: bold;
    border-bottom: none;
  }
}


// .paginationSection {
//   margin-top: 24px;
//   display: flex;
//   justify-content: center;
// }

</style>
