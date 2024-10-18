import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Install the plugin: npm install vite-plugin-static-copy --save-dev
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'public/_headers',
          dest: ''  // Copy to root of dist folder
        }
      ]
    })
  ],
  build: {
    outDir: 'dist'
  }
});