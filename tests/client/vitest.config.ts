import react from '@vitejs/plugin-react';
import {defineProject} from 'vitest/config';

export default defineProject({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['dotenv/config', './vitest.setup.ts'],
  }
});
