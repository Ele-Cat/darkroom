import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const isDebug = env.VITE_APP_DEBUG === 'true'
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      // 调试模式下生成sourcemap
      sourcemap: isDebug,
      // 调试模式下不进行代码压缩
      minify: !isDebug ? 'terser' : false,
      // 生产模式下的压缩选项
      terserOptions: {
        compress: {
          drop_console: !isDebug, // 生产模式下移除console
          drop_debugger: !isDebug // 生产模式下移除debugger
        }
      }
    }
  }
})