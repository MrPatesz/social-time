import {defineProject} from 'vitest/config';

export default defineProject({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['dotenv/config'],
    threads: false,
  }
});
