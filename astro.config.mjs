// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://jacky-zhong.com',
  integrations: [react(), sitemap()],
  vite: {
    ssr: {
      noExternal: ['p5'],
    },
    optimizeDeps: {
      exclude: ['p5'],
    },
  },
});
