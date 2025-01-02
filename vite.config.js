import { defineConfig } from 'vite';
import MonacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  build: {
    lib: {
      entry: './index.js',
      name: 'monacoAlpinejs',
      fileName: (format) => `monaco-alpinejs.${format}.js`,
    },
    rollupOptions: {
      external: ['monaco-editor'],
      output: {
        globals: {
          'monaco-editor': 'monaco',
        },
      },
    },
  },
  plugins: [
    MonacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json', 'css', 'html', 'typescript'],
    }),
  ],
  resolve: {
    alias: {
      'monaco-editor/esm/vs': 'monaco-editor/esm/vs', // Ensure correct resolution
    },
  },
});
