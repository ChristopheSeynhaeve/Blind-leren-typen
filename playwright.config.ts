import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/*.spec.ts',use:{browserName:'chromium',channel:'msedge',headless:true},reporter:'list'});
