<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue';
import { backHomeApi } from '@/utils/publicApi';
import Swal from 'sweetalert2';
import Papa from 'papaparse'; // 建議引入來處理 CSV 覆蓋

const router = useRouter()
const route = useRoute()
const handleCancel = () => {
  Swal.fire({
    title: '確定要取消嗎？',
    text: '未儲存的內容將會遺失',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#E14720',
    cancelButtonColor: '#0E6273',
    confirmButtonText: '確定離開',
    cancelButtonText: '留在此頁',
  }).then((result) => {
    if (result.isConfirmed) {
      router.push({ name: 'impact' })
    }
  })
}

// 1. 初始化表單結構 (對齊 API 回傳的格式)
const form = reactive({
  id: null,
  year: '',
  core_metrics: {
    total_rescued_turtles: 0,
    hatchlings_guided_to_sea: 0,
    patrolled_coastline_km: 0,
    professional_medical_surgeries: 0,
    turtles_released:0
  },
  ocean_debris_removed_kg: {
    plastic_bottles: 0,
    iron_cans: 0,
    aluminum_cans: 0,
    waste_paper: 0,
    glass_bottles: 0,
    styrofoam: 0,
    bamboo_wood: 0,
    ghost_nets_fishing_gear: 0,
    unclassifiable_waste: 0
  }
})

// 2. 載入資料並回填
const loadImpactData = async () => {
  const id = route.params.id
  if (!id) return

  try {
    const response = await backHomeApi.get(`./donation/impact_get.php?id=${id}`)
    // 直接將回傳資料合併到 reactive 物件
    Object.assign(form, response.data)
  } catch (error) {
    console.error('載入資料失敗:', error)
    Swal.fire({ title: '錯誤', text: '找不到該資料', icon: 'error' })
  }
}

// 3. 處理 CSV 上傳覆蓋
const handleFileChange = (file) => {
  Papa.parse(file.raw, {
    header: true,
    skipEmptyLines: true, // 避免讀取到空白行
    complete: (results) => {
      const row = results.data[0]; // 取得第一筆數據
      if (row) {
        // --- 核心救援數據 (整數) ---
        form.core_metrics.total_rescued_turtles = parseInt(row.TURTLES_IN_REHAB) || 0;
        form.core_metrics.hatchlings_guided_to_sea = parseInt(row.HATCHLINGS_GUIDED) || 0;
        form.core_metrics.patrolled_coastline_km = parseInt(row.COASTLINE_PATROLLED) || 0;
        form.core_metrics.professional_medical_surgeries = parseInt(row.MEDICAL_SURGERIES) || 0;
        form.core_metrics.turtles_released = parseInt(row.TURTLES_RELEASED) || 0;

        // --- 海洋廢棄物數據 (浮點數) ---
        // 對應 DECIMAL(10,2)
        form.ocean_debris_removed_kg.plastic_bottles = parseFloat(row.PET_BOTTLES) || 0;
        form.ocean_debris_removed_kg.iron_cans = parseFloat(row.IRON_CANS) || 0;
        form.ocean_debris_removed_kg.aluminum_cans = parseFloat(row.ALUMINUM_CANS) || 0;
        form.ocean_debris_removed_kg.waste_paper = parseFloat(row.WASTE_PAPER) || 0;
        form.ocean_debris_removed_kg.glass_bottles = parseFloat(row.GLASS_BOTTLES) || 0;
        form.ocean_debris_removed_kg.styrofoam = parseFloat(row.STYROFOAM) || 0;
        form.ocean_debris_removed_kg.bamboo_wood = parseFloat(row.BAMBOO_WOOD) || 0;
        form.ocean_debris_removed_kg.ghost_nets_fishing_gear = parseFloat(row.FISHING_GEAR) || 0;
        form.ocean_debris_removed_kg.unclassifiable_waste = parseFloat(row.UNSORTED_WASTE) || 0;

        // 注意：TURTLES_RELEASED 若有需要也可以加上
        
        Swal.fire({
          title: '資料已覆蓋',
          text: '已成功從 CSV 匯入數據，請確認無誤後點擊儲存。',
          icon: 'success',
          confirmButtonColor: '#0E6273'
        });
      } else {
        Swal.fire('錯誤', 'CSV 檔案內容為空', 'error');
      }
    },
    error: (err) => {
      Swal.fire('解析失敗', '請確認 CSV 格式是否正確', 'error');
    }
  });
}

// 4. 送出編輯 API
const handleSubmit = async () => {
  try {
    // 確保這裡傳送的是整個物件
    const res = await backHomeApi.post('./donation/impact_update.php', form);
    if(res.data.status === 'success') {
       Swal.fire('更新成功', res.data.message, 'success');
       router.push({ name: 'impact' });
    }
  } catch (error) {
    Swal.fire('錯誤', error.response?.data?.message || '更新過程發生異常', 'error');
  }
}

onMounted(() => {
  loadImpactData()
})
</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="編輯我們的影響力資料" />
    <div class="form-container">
      <el-form label-width="150px">
        <el-form-item label="資料年份">
          <el-input v-model="form.year" disabled style="width: 300px" />
          <span class="tip">年份不可修改</span>
        </el-form-item>

        <el-divider content-position="left">核心救援數據</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="救援海龜總數" required>
              <el-input-number v-model="form.core_metrics.total_rescued_turtles" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="引導入海幼龜" required>
              <el-input-number v-model="form.core_metrics.hatchlings_guided_to_sea" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="巡邏海岸線" required>
              <el-input-number v-model="form.core_metrics.patrolled_coastline_km" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="專業醫療手術" required>
              <el-input-number v-model="form.core_metrics.professional_medical_surgeries" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="海龜野放總數" required>
              <el-input-number v-model="form.core_metrics.turtles_released" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">海洋廢棄物 (kg)</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="寶特瓶" required>
          <el-input-number v-model="form.ocean_debris_removed_kg.plastic_bottles" :precision="2" />
        </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="鐵罐" required>
          <el-input-number v-model="form.ocean_debris_removed_kg.iron_cans" :precision="2" />
        </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="鋁罐" required>
          <el-input-number v-model="form.ocean_debris_removed_kg.aluminum_cans" :precision="2" />
        </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="廢紙" required>
          <el-input-number v-model="form.ocean_debris_removed_kg.waste_paper" :precision="2" />
        </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="玻璃瓶" required>
          <el-input-number v-model="form.ocean_debris_removed_kg.glass_bottles" :precision="2" />
        </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保麗龍" required> 
          <el-input-number v-model="form.ocean_debris_removed_kg.styrofoam" :precision="2" />
        </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="竹木" required>
          <el-input-number v-model="form.ocean_debris_removed_kg.bamboo_wood" :precision="2" />
        </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="廢漁具漁網" required>
          <el-input-number v-model="form.ocean_debris_removed_kg.ghost_nets_fishing_gear" :precision="2" />
        </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="無法分類廢棄物" required>
          <el-input-number v-model="form.ocean_debris_removed_kg.unclassifiable_waste" :precision="2" />
        </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="快速更新 (CSV)">
          <el-upload action="#" :auto-upload="false" :on-change="handleFileChange" :limit="1">
            <el-button class="btn-CSV" >透過 CSV 覆蓋數據</el-button>
          </el-upload>
        </el-form-item>

        <div class="form-footer">
          <el-button type="primary" class="btn-submit" @click="handleSubmit">儲存變更</el-button>
          <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>



<style scoped lang="scss">
  .pageContainer {
padding: 30px; 
  min-height: 100vh;
  box-sizing: border-box;
}
/* 表單樣式 */
.form-container {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}

.btn-CSV{
  border-color: $secondary-color;
  color: $secondary-color;
  padding: 10px 30px;
}

.form-footer  {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  .btn-submit {
    background-color: $secondary-color;
    border-color: $secondary-color;
    padding: 10px 30px;
  }
  
  .btn-cancel {
    border-color: $secondary-color;
    color: $secondary-color;
    padding: 10px 30px;
  }

}

</style>