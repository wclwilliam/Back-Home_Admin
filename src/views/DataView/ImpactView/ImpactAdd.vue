<script setup>
import { reactive,ref, computed } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue';
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2';
import { backHomeApi } from '@/utils/publicApi'
import Papa from 'papaparse'

const router = useRouter();
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


const form = reactive({ year: '' })
const selectedFile = ref(null)

const yearValidator = computed(() => /^(19|20)\d{2}$/.test(form.year.trim()))

// 預期的正確欄位清單 (對照您的 IMPACT_METRICS 表格)
const expectedFields = [
  'TURTLES_IN_REHAB', 'TURTLES_RELEASED', 'HATCHLINGS_GUIDED', 
  'COASTLINE_PATROLLED', 'MEDICAL_SURGERIES', 'TOTAL_WASTE',
  'PET_BOTTLES', 'IRON_CANS', 'ALUMINUM_CANS', 'WASTE_PAPER',
  'GLASS_BOTTLES', 'STYROFOAM', 'BAMBOO_WOOD', 'FISHING_GEAR', 'UNSORTED_WASTE'
];

const handleFileChange = (file) => {
  selectedFile.value = file.raw;
  
  // 自動判斷格式
  Papa.parse(file.raw, {
    header: true,
    complete: (results) => {
      const fields = results.meta.fields;
      // 檢查 CSV 標頭是否包含所有必要欄位
      const isValid = expectedFields.every(field => fields.includes(field));
      
      if (!isValid) {
        Swal.fire('格式錯誤', 'CSV 欄位名稱不正確，請檢查範本。', 'error');
        selectedFile.value = null; // 清除檔案
      } else {
        Swal.fire('格式正確', '已成功解析數據檔案。', 'success');
      }
    }
  });
}

const submitUpload = async () => {
  if (!form.year || !yearValidator.value || !selectedFile.value) {
    return Swal.fire('提示', '請填寫年份並選擇正確的 CSV 檔案', 'info');
  }

  const formData = new FormData();
  formData.append('data_year', form.year);
  formData.append('csv_file', selectedFile.value);

  try {
    const res = await backHomeApi.post('donation/impact_add.php', formData);
    Swal.fire('上傳成功', `已新增 ${form.year} 年度數據`, 'success');
    router.push({ name: 'impact' });
  } catch (err) {
    Swal.fire('失敗', err.response?.data?.message || '上傳出錯', 'error');
  }
}

</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="新增我們的影響力資料" />
    <div class="form-container">
      <el-form label-width="150px">
        <el-form-item label="資料年份" required>
          <el-input
                v-model="form.year"
                placeholder="請輸入年份"
                maxlength="10"
                style="width: 300px"
              />
        </el-form-item>

        <el-form-item label="數據上傳(CSV檔案)" required>
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <el-button class="upload-btn">上傳檔案 +</el-button>
          </el-upload>
        </el-form-item>

        <div class="action-buttons">
          <el-button type="primary" class="submit-btn" @click="submitUpload">資料上傳</el-button>
          <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
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

.upload-btn {
  width: 300px;
  background-color: #fff;
  border: 1px solid #ccc;
}

.action-buttons {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.submit-btn {
  background-color: $secondary-color;
  border-color: $secondary-color;
  padding: 10px 30px;
}

.cancel-btn {
  border-color: $secondary-color;
  color: $secondary-color;
  padding: 10px 30px;
}
</style>