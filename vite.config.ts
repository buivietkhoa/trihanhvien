import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // db.json do JSON Server ghi liên tục; nếu Vite theo dõi file này, mỗi lần ghi
    // sẽ tải lại trang và cắt ngang các thao tác nhiều bước (đặt lịch, nạp coin...).
    watch: { ignored: ['**/db.json'] },
  },
})
