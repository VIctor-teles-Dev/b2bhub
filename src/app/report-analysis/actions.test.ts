import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { startScraping, checkStatus } from "./actions";
import fs from "fs";

// Mocks
mock.module("playwright", () => ({
    chromium: {
        launch: async () => ({
            newContext: async () => ({
                newPage: async () => ({
                    goto: async () => { },
                    waitForTimeout: async () => { },
                    waitForLoadState: async () => { },
                    locator: () => ({
                        isVisible: async () => false,
                        click: async () => { },
                        hover: async () => { },
                        all: async () => [],
                        count: async () => 0,
                        first: () => ({ innerText: async () => "100%" }),
                        last: () => ({ innerText: async () => "100%" }),
                        filter: () => ({ first: () => ({ count: async () => 0, click: async () => { } }) }),
                        selectOption: async () => { },
                    }),
                    evaluate: async () => [],
                    waitForSelector: async () => { },
                }),
                close: async () => { },
            }),
            close: async () => { },
        }),
    },
}));

// Mock fs to avoid writing to disk during tests
const originalWriteFileSync = fs.writeFileSync;
const originalExistsSync = fs.existsSync;
const originalMkdirSync = fs.mkdirSync;

describe("Report Analysis Actions", () => {
    beforeEach(() => {
        process.env.DIGESTO_API_TOKEN = "test-token";
        // Mock FS
        fs.writeFileSync = mock(() => { }) as typeof fs.writeFileSync;
        fs.existsSync = mock(() => false) as typeof fs.existsSync;
        fs.mkdirSync = mock(() => undefined) as typeof fs.mkdirSync;
    });

    afterEach(() => {
        fs.writeFileSync = originalWriteFileSync;
        fs.existsSync = originalExistsSync;
        fs.mkdirSync = originalMkdirSync;
    });

    test("startScraping should return error if no IDs provided", async () => {
        const result = await startScraping("");
        expect(result.error).toBeDefined();
    });

    test("startScraping should return taskId for valid input", async () => {
        const result = await startScraping("123456");
        expect(result.taskId).toBeDefined();
        expect(result.status).toBe("PENDING");
    });

    test("checkStatus should return task status", async () => {
        const startResult = await startScraping("123456");
        if (!startResult.taskId) throw new Error("Task ID not returned");

        const status = await checkStatus(startResult.taskId);
        if ("error" in status) throw new Error("Unexpected error");

        expect(status.status).toBeDefined();
        expect(["PENDING", "RUNNING", "COMPLETED", "ERROR"]).toContain(status.status);
    });
});
