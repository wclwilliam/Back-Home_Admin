import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
// 原本export default defineConfig({…})
// 變成export default defineConfig(({mode})=>{return{...}})

export default defineConfig(({ mode }) => {
  // 讀取 .env、.env.[mode]，第三個參數用 '' 才會包含非 VITE_ 前綴
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      // vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          additionalData: `
        @import "@/assets/scss/base/_color.scss";
        @import "@/assets/scss/base/_font.scss";
        @import "@/assets/scss/base/_var.scss";
        @import "@/assets/scss/mixin/_mixins.scss";`,
        },
      },
    },
    server: {
      proxy: {
        '/API': {
          target: 'http://localhost:8888',
          changeOrigin: true,
        },
      },
    },
    base: env.VITE_BASE || '/admin/',
    build: { outDir: env.VITE_OUT_DIR || 'dist' },
  }
})
