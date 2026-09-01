import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' 让构建产物可部署在任意子路径（GitHub Pages 项目页 / aiforce 上传均可）
export default defineConfig({
  base: './',
  plugins: [react()],
})
