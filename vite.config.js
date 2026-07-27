import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/ivan-marry/',
  plugins: [vue()],
  server: {
    hmr: false,
  },
});
