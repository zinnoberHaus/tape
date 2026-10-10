import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',timeout:60000,use:{baseURL:process.env.TAPE_TEST_URL||'http://localhost:43817',viewport:{width:1440,height:1000},trace:'retain-on-failure'},outputDir:'artifacts/test-results',reporter:'list',workers:1});
