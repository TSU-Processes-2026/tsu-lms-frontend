import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    retries: 0,
    workers: 1,
    timeout: 30000,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:5173',
        headless: false,
        viewport: { width: 1280, height: 900 },
        actionTimeout: 10000,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 30000,
    },
});
