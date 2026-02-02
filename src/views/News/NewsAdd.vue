<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'
import { backHomeApi } from '@/utils/publicApi'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import {
  ClassicEditor, Essentials, Paragraph, Heading, Bold, Italic,
  Link, List, BlockQuote, Image, ImageUpload, FileRepository, ImageResize, ImageStyle, ImageToolbar
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'
import Swal from 'sweetalert2'


// 取得管理員資訊
const fetchAdminInfo = async () => {
  try {
    // 使用正確的 token 鍵名：ADMIN_TOKEN
    const token = localStorage.getItem('ADMIN_TOKEN')
    
    console.log('Token:', token ? '已找到' : '未找到') // 調試用
    
    // 構建請求配置
    const config = {}
    if (token) {
      config.headers = {
        'Authorization': `Bearer ${token}`
      }
    }
    
    const response = await backHomeApi.get('./news/get_admin_account.php', config)
    console.log('API 回應:', response.data) // 調試用
    
    if (response.data && response.data.success && response.data.admin_account) {
      formData.admin = response.data.admin_account
      console.log('成功設置管理員:', formData.admin) // 調試用
    } else {
      console.error('回應格式錯誤:', response.data)
      formData.admin = 'unknown'
    }
  } catch (error) {
    console.error('取得管理員資訊失敗:', error)
    console.error('錯誤詳情:', error.response?.data) // 調試用
    formData.admin = 'unknown'
  }
}

// 頁面載入時自動取得管理員資訊
onMounted(() => {
  fetchAdminInfo()
})

const getTodayDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

//CKEditor上傳
// 1. 定義真正的上傳轉接器
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  // 當圖片被丟入編輯器時觸發
  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('upload', file);
      const apiBase = import.meta.env.VITE_API_BASE;
      fetch(`${apiBase}/news/news_upload_image.php`, {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          if (!response.ok) throw new Error('伺服器回應錯誤');
          return response.json();
        })
        .then(result => {
          if (result.error) {
            reject(result.error.message);
          } else {
            resolve({
              default: result.url
            });
          }
        })
        .catch(error => {
          reject('圖片上傳失敗：' + error.message);
        });
    }));
  }
}

// 2. 將轉接器掛載到 CKEditor 的外掛系統
function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

// 3. CKEditor 完整配置
const editor = ClassicEditor;
const editorConfig = {
  licenseKey: 'GPL',
  plugins: [
    Essentials, Paragraph, Heading, Bold, Italic, Link,
    List, BlockQuote, Image, ImageUpload, FileRepository, ImageResize, ImageStyle, ImageToolbar
  ],
  extraPlugins: [MyCustomUploadAdapterPlugin],
  image: {
    toolbar: [
      'imageStyle:inline',
      'imageStyle:wrapText',
      'imageStyle:breakText',
      '|',
      'toggleImageCaption',
      'imageTextAlternative'
    ]
  },
  toolbar: [
    'heading', '|', 'bold', 'italic', 'link', '|',
    'bulletedList', 'numberedList', '|', 'uploadImage',
    'blockQuote', '|', 'undo', 'redo'
  ],
};

// 表單資料
const formData = reactive({
  admin: '載入中',
  title: '',
  category: '',
  date: getTodayDate(),
  content: '',
  imageFile: null,
  imageUrl: '',
  imageName: '測試.png'
})

const handleImageChange = (uploadFile) => {
  const isImage = uploadFile.raw.type.startsWith('image/');
  if (!isImage) {
    Swal.fire("錯誤", "只允許上傳圖片格式 (JPG/PNG)", "error");
    return;
  }
  formData.imageName = uploadFile.name
  formData.imageFile = uploadFile.raw
  formData.imageUrl = URL.createObjectURL(uploadFile.raw)
}

const router = useRouter()

const goBack = () => {
  Swal.fire({
    title: '確定要取消嗎？',
    text: "未儲存的內容將會遺失",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#E14720',
    cancelButtonColor: '#0E6273',
    confirmButtonText: '確定離開',
    cancelButtonText: '留在此頁'
  }).then((result) => {
    if (result.isConfirmed) {
      router.back()
    }
  })
}

const submitForm = async (targetStatus) => {
  if (!formData.title || !formData.content || !formData.imageFile) {
    Swal.fire("錯誤", "標題、內容與封面圖片皆為必填", "error");
    return;
  }
  if (formData.admin === '載入中' || formData.admin === 'unknown') {
    Swal.fire("錯誤", "管理員資訊尚未載入，請稍後再試", "error");
    return;
  }
  const postData = new FormData();
  postData.append('title', formData.title);
  postData.append('category', formData.category);
  postData.append('content', formData.content);
  postData.append('admin', formData.admin);
  postData.append('status', targetStatus);

  if (formData.imageFile) {
    postData.append('image', formData.imageFile);
  }

  try {
    const response = await backHomeApi.post('./news/news_add.php', postData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.success) {
      Swal.fire({
        title: targetStatus === 'published' ? "文章已發布!" : "草稿已儲存!",
        icon: 'success',
        confirmButtonColor: '#0E6273'
      }).then(() => {
        router.back();
      });
    }
  } catch (error) {
    console.error('操作失敗:', error);
    Swal.fire("失敗", error.response?.data?.error || "系統連線錯誤", "error");
  }
};

const postNews = () => submitForm('published');
const saveDraft = () => submitForm('draft');

</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="新增最新消息" />

    <div class="formContainer">
      <el-form :model="formData" label-width="100px" label-position="left" class="customForm">

        <el-row :gutter="40">
          <el-col :span="10" >
            <el-form-item label="日期" label-width="100px">
              <el-input v-model="formData.date" disabled class="readOnlyInput" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="標題">
          <el-input v-model="formData.title" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="請輸入標題"
            maxlength="100" show-word-limit />
        </el-form-item>

        <el-row :gutter="40">
          <el-col :span="10">
            <el-form-item label="分類">
              <el-select v-model="formData.category" placeholder="請選擇分類" style="width: 100%">
                <el-option label="重要公告" value="重要公告" />
                <el-option label="異動通知" value="異動通知" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10" :offset="4">
            <el-form-item label="發布管理者帳號" label-width="120px">
              <el-input v-model="formData.admin" disabled class="readOnlyInput" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面圖片">
          <div class="uploadSection">
            <el-upload class="uploadBtn" action="#" :auto-upload="false" :show-file-list="false"
              :on-change="handleImageChange"
              accept="image/jpeg,image/png">
              <el-button>上傳檔案 +</el-button>
            </el-upload>

            <div class="imagePreview" v-if="formData.imageUrl">
              <el-image :src="formData.imageUrl" fit="cover" class="previewImg" />
              <span class="fileName">{{ formData.imageName }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="文字內容">
          <div class="editor-container">
            <Ckeditor :editor="editor" v-model="formData.content" :config="editorConfig" />
          </div>
        </el-form-item>

        <div class="formFooter">
          <el-button class="actionBtn" plain @click="postNews">發布</el-button>
          <el-button class="actionBtn" plain @click="saveDraft">儲存草稿</el-button>
          <el-button class="actionBtn" plain @click="goBack">取消</el-button>
        </div>

      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pageContainer {
  padding: 30px;
  min-height: 100vh;
  box-sizing: border-box;
}

.customForm {
  :deep(.el-form-item__label) {
    font-weight: bold;
    color: $text-color;
    letter-spacing: 1px;
  }

  .readOnlyInput {
    :deep(.el-input__wrapper) {
      background-color: #dcdcdc;
      box-shadow: none;
      border: 1px solid #999;
    }

    :deep(.el-input__inner) {
      color: #000;
      font-weight: bold;
      text-align: center;
    }
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-color: $secondary-color;
    resize: none;
  }
}

.uploadSection {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  width: 100%;

  .uploadBtn {
    :deep(.el-button) {
      border: 1px solid $secondary-color;
      color: $secondary-color;
      width: 120px;
    }
  }

  .imagePreview {
    display: flex;
    align-items: flex-end;
    gap: 20px;

    .previewImg {
      width: 200px;
      height: 120px;
      border-radius: 4px;
      margin-bottom: 4px;
      border: 1px solid #ccc;
    }

    .fileName {
      font-size: 12px;
      color: $text-color;
    }
  }
}

.editor-container {
  width: 100%;

  :deep(.ck-editor__editable) {
    min-height: 300px;
  }

  :deep(.ck-content) {
    p {
      margin-bottom: 1em;
      line-height: 1.6;
      font-size: 16px;
    }

    h2 {
      font-size: 32px;
      font-weight: bold;
      margin-top: 0.67em;
      margin-bottom: 0.67em;
      line-height: 1.2;
    }

    h3 {
      font-size: 24px;
      font-weight: bold;
      margin-top: 0.83em;
      margin-bottom: 0.83em;
      line-height: 1.3;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }

    h4 {
      font-size: 18px;
      font-weight: bold;
      margin-top: 1em;
      margin-bottom: 1em;
      line-height: 1.4;
    }

    strong, b {
      font-weight: bold !important;
    }

    ol {
      list-style-type: decimal;
      margin-left: 20px;
      margin-bottom: 1em;
    }

    ul {
      list-style-type: disc;
      margin-left: 20px;
      margin-bottom: 1em;
    }

    i, em {
      font-style: italic;
    }

    img {
      max-width: 100%;
      height: auto;
      margin: 10px 0;
    }

    blockquote {
      border-left: 5px solid #ccc;
      margin: 1.5em 10px;
      padding: 0.5em 10px;
      color: $text-color;
      background-color: #f9f9f9;
    }
  }
}

.formFooter {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;

  .actionBtn {
    width: 100px;
    border-color: $secondary-color;
    color: $secondary-color;
    font-weight: bold;

    &:hover {
      background-color: $secondary-color;
      color: #fff;
    }
  }
}
</style>