import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' 让构建产物可部署在任意子路径（GitHub Pages 项目页 / aiforce 上传均可）
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // 单文件部署：所有图片/视频/字体以 base64 内联（约10MB单HTML，可直接上传任意平台）
    assetsInlineLimit: 100 * 1024 * 1024,
  },
})
