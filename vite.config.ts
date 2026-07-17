import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Windows can lock large media files and crash Vite's FSWatcher
      ignored: [
        '**/public/music/**',
        '**/public/cars/**',
        '**/cv/**',
        '**/*.pdf',
        '**/*.mp3',
        '**/*.glb',
        '**/*.gltf',
      ],
    },
  },
})
