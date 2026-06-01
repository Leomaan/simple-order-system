import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  test: {
    include: [
      'tests/**/*.test.js',           
      'tests/**/*.integration.test.js' 
    ],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    globals: true, 
  },
});