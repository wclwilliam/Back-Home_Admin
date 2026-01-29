<script setup>
import { reactive, onMounted} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminHeader from '@/components/AdminHeader.vue'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
// 從主套件 ckeditor5 引入所有需要的組件
import { 
  ClassicEditor, Essentials, Paragraph, Heading, Bold, Italic, 
  Link, List, BlockQuote, Image, ImageUpload, FileRepository 
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css' // 必須引入 CSS 樣式才會正常顯示
import Swal from 'sweetalert2'
import { backHomeApi } from "@/utils/publicApi"


//CKEditor上傳
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file
      .then(file => new Promise((resolve) => {
        resolve({
          default: URL.createObjectURL(file)
        });
      }));
  }
  abort() { }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

const editor = ClassicEditor
const editorConfig = {
  placeholder: '請在此輸入詳細內容...',
  // 必須加入這些 plugins 才能運作
  plugins: [ 
    Essentials, Paragraph, Heading, Bold, Italic, Link, 
    List, BlockQuote, Image, ImageUpload, FileRepository 
  ],
  extraPlugins: [MyCustomUploadAdapterPlugin],
  toolbar: [
    'heading', '|',
    'bold', 'italic', 'link', '|',
    'bulletedList', 'numberedList', '|',
    'uploadImage', 'blockQuote', '|',
    'undo', 'redo'
  ],
}



const router = useRouter()
const route = useRoute()
const fileUrl = import.meta.env.VITE_FILE_URL
// 表單資料
const formData = reactive({
  id: '',
  admin: '',
  title: '',
  category: 'important',
  date: '',
  content: '',
  imageUrl: '',
  imageName: ''
})

// 載入單篇文章編輯
const loadArticleData = async () => {
  const id = route.params.id
  if (!id) return // 沒有id就是新增模式

  try {
    const response = await backHomeApi.get(`./news/news_get.php?id=${id}`)
    const data = response.data

    //後端回傳的資料 map 到 formData
    formData.id = data.id
    formData.admin = data.author_id
    formData.title = data.title
    formData.category = data.category
    formData.date = data.published_at
    formData.content = data.content
    // 圖片預覽
    if (data.image_path) {
      formData.imageUrl = fileUrl + data.image_path
      formData.imageName = data.image_path.split('/').pop() // 取得檔名
    }
  } catch (error) {
    console.error('載入資料失敗:', error)
    Swal.fire('錯誤', '找不到該文章', 'error')
  }
}

 // 組件掛載後執行
onMounted(() => {
  loadArticleData()
})


const handleImageChange = (uploadFile) => {
  formData.imageName = uploadFile.name
  formData.imageUrl = URL.createObjectURL(uploadFile.raw)
}


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

const postNews = () => {
  Swal.fire({
    title: "文章已發布!",
    icon: 'success',
    draggable: true
  }).then((result) => {
    if (result.isConfirmed) {
      router.back()
    }
  })
}
</script>

<template>
  <div class="pageContainer">
    <AdminHeader title="編輯最新消息" />

    <div class="formContainer">
      <el-form :model="formData" label-width="100px" label-position="left" class="customForm">

        <el-row :gutter="40">
          <el-col :span="10">
            <el-form-item label="文章編號">
              <el-input v-model="formData.id" disabled class="readOnlyInput" />
            </el-form-item>
          </el-col>
          <el-col :span="10" :offset="4">
            <el-form-item label="發布管理者帳號" label-width="120px">
              <el-input v-model="formData.admin" disabled class="readOnlyInput" />
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
                <el-option label="重要公告" value="important" />
                <el-option label="異動通知" value="change" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10" :offset="4">
            <el-form-item label="日期" label-width="120px">
              <el-input v-model="formData.date" disabled class="readOnlyInput" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面圖片">
          <div class="uploadSection">
            <el-upload class="uploadBtn" action="#" :auto-upload="false" :show-file-list="false"
              :on-change="handleImageChange">
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
          <el-button class="disableBtn" disabled plain>儲存草稿</el-button>
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

.customForm {
  :deep(.el-form-item__label) {
    font-weight: bold;
    color: $text-color;
    letter-spacing: 1px;
  }

  //Disabled Input 
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

  .disableBtn {
    background-color: #dcdcdc;
    border: 1px solid #999;
    color: #999;
    font-weight: bold;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-color: $secondary-color;
    resize: none;

  }
}

.logoutBtn {
  border: 1px solid $secondary-color;
  color: $secondary-color;
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


    strong,
    b {
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

    i,
    em {
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