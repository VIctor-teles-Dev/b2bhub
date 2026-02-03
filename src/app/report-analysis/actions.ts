"use server";

import { chromium, Browser, Page, BrowserContext } from "playwright";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { CONFIG } from "./actions.config";

import {
    MAX_RETRIES as OLD_MAX_RETRIES,
    RETRY_DELAY_MS,
    CACHE_TTL_MS,
    MAX_CONCURRENT_CONTEXTS,
    BROWSER_ARGS,
    DIGESTO_URLS,
    TIMEOUTS,
} from "./config";
import { getTribunalFromCnj } from "./court-mapping";
import type { TaskState, ReportStats, ReportData, StartScrapingResult } from "./types";

// Use settings from CONFIG where available, fallback to config.ts
const { MAX_RETRIES = OLD_MAX_RETRIES, RETRY_DELAY = RETRY_DELAY_MS, PARALLEL_LIMIT = MAX_CONCURRENT_CONTEXTS } = CONFIG;

// Task storage using Map for better performance
const TASKS: Map<string, TaskState> = new Map();

/**
 * Delays execution for specified milliseconds
 */
const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Splits an array into chunks of specified size
 */
function chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from(
        { length: Math.ceil(array.length / size) },
        (_, i) => array.slice(i * size, i * size + size)
    );
}

/**
 * Checks if a cached file is still valid
 */
function isCacheValid(filepath: string): boolean {
    if (!fs.existsSync(filepath)) return false;

    const stats = fs.statSync(filepath);
    const fileAge = Date.now() - stats.mtimeMs;
    return fileAge < CACHE_TTL_MS;
}

/**
 * Ensures the data directory exists
 * Uses /tmp on Vercel (serverless) since the filesystem is read-only
 */
function ensureDataDir(): string {
    const isVercel = process.env.VERCEL === "1";
    const baseDir = isVercel ? "/tmp" : process.cwd();
    const dataDir = path.join(baseDir, "data");

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    return dataDir;
}

/**
 * Gets the appropriate report URL based on ID length
 */
function getReportUrl(reportId: string): string {
    return reportId.length === 6
        ? `${DIGESTO_URLS.report}${reportId}`
        : `${DIGESTO_URLS.virtual}${reportId}`;
}

class ScraperService {
    private bearerToken: string;

    constructor(bearerToken: string) {
        this.bearerToken = bearerToken;
    }

    public startScrapingTask(reportIds: string[]): string {
        const uniqueIds = Array.from(new Set(reportIds));
        const taskId = uuidv4();

        TASKS.set(taskId, {
            status: "PENDING",
            message: "Inicializando...",
            result: null,
            stats: null,
            errors: [],
        });

        // Start background processing
        this.runScraping(taskId, uniqueIds).catch(err => {
            console.error(`Task ${taskId} failed fatally:`, err);
            const task = TASKS.get(taskId);
            if (task) {
                task.status = "ERROR";
                task.message = `Erro fatal: ${err.message}`;
            }
        });

        return taskId;
    }

    private async runScraping(taskId: string, reportIds: string[]): Promise<void> {
        const task = TASKS.get(taskId);
        if (!task) return;

        task.status = "RUNNING";
        task.message = "Iniciando navegador...";

        const results: string[] = [];
        const errors: string[] = [];
        const total = reportIds.length;
        const dataDir = ensureDataDir();

        let browser: Browser | null = null;

        try {
            browser = await chromium.launch({
                headless: true,
                args: [...BROWSER_ARGS],
            });

            let processedCount = 0;

            const processReport = async (reportId: string): Promise<void> => {
                try {
                    const result = await this.processWithRetry(browser!, reportId, dataDir);
                    if (result) {
                        results.push(result);
                    } else {
                        errors.push(`ID ${reportId}: Sem dados ou erro após tentativas`);
                    }
                } catch (e: any) {
                    errors.push(`ID ${reportId}: ${e.message}`);
                } finally {
                    processedCount++;
                    const currentTask = TASKS.get(taskId);
                    if (currentTask) {
                        currentTask.message = `Processando ${processedCount}/${total} (${PARALLEL_LIMIT} em paralelo)`;
                    }
                }
            };

            // Run with concurrency limit
            await this.runWithConcurrencyLimit(reportIds, processReport, PARALLEL_LIMIT);

            task.stats = this.calculateStats(results);
            task.result = results;
            task.errors = errors;
            task.message = `Concluído! ${results.length}/${total} relatórios processados.`;
            task.status = "COMPLETED";

        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
            task.status = "ERROR";
            task.message = `Erro fatal: ${errorMessage}`;
        } finally {
            if (browser) await browser.close();
        }
    }

    /**
     * Executes async tasks with a concurrency limit (Promise pooling).
     */
    private async runWithConcurrencyLimit<T>(
        items: T[],
        fn: (item: T) => Promise<void>,
        limit: number
    ): Promise<void> {
        const executing: Promise<void>[] = [];

        for (const item of items) {
            const promise = fn(item).then(() => {
                executing.splice(executing.indexOf(promise), 1);
            });
            executing.push(promise);

            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }

        await Promise.all(executing);
    }

    private async processWithRetry(
        browser: Browser,
        reportId: string,
        dataDir: string
    ): Promise<string | null> {
        const filename = path.join(dataDir, `report_${reportId}_numbers.json`);

        if (isCacheValid(filename)) {
            return filename;
        }

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const data = await this.processSingleReport(browser, reportId);

                if (!data?.numbers) {
                    if (attempt === MAX_RETRIES) return null;
                    await delay(RETRY_DELAY * attempt);
                    continue;
                }

                fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf-8");
                return filename;

            } catch (e: unknown) {
                if (attempt < MAX_RETRIES) {
                    await delay(RETRY_DELAY * attempt);
                    continue;
                }
                const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
                throw new Error(`${errorMessage} (após ${MAX_RETRIES} tentativas)`);
            }
        }

        return null;
    }

    private async processSingleReport(browser: Browser, reportId: string): Promise<ReportData | null> {
        const context = await this.createBrowserContext(browser);
        const page = await context.newPage();

        try {
            const url = getReportUrl(reportId);
            await page.goto(url, { waitUntil: "networkidle", timeout: TIMEOUTS.navigation });
            await delay(1500);

            await this.clickUpdateLinkIfVisible(page);
            await page.waitForLoadState("networkidle");
            await delay(2500);

            await this.applyFilter(page);
            await this.setPagination(page);

            return {
                numbers: await this.extractData(page),
                progress: await this.extractProgress(page),
            };

        } finally {
            await context.close();
        }
    }

    private async createBrowserContext(browser: Browser): Promise<BrowserContext> {
        return browser.newContext({
            extraHTTPHeaders: { Authorization: `Bearer ${this.bearerToken}` },
            viewport: { width: 1366, height: 768 },
        });
    }

    private async clickUpdateLinkIfVisible(page: Page): Promise<void> {
        try {
            const updateLink = page.locator("a:has-text('Pedido de atualização')");
            if (await updateLink.isVisible({ timeout: TIMEOUTS.element })) {
                await updateLink.click();
            }
        } catch {
            // Link not found, continue
        }
    }

    private async applyFilter(page: Page): Promise<void> {
        try {
            const statusHeaderCell = page.locator(".ui-grid-header-cell:has-text('Status')");

            await statusHeaderCell.hover({ timeout: 5000 });
            const buttons = await statusHeaderCell.locator("button").all();

            const filterBtn = buttons.find(async btn => (await btn.innerText()).includes("...")) ?? buttons[0];

            if (filterBtn) {
                await filterBtn.click();
            } else {
                await statusHeaderCell.locator(".ui-grid-icon-menu").click();
            }

            await delay(1000);

            const pattern = /N[ãa]o\s+Atualizado(s)?/i;
            const textCell = page.locator("div.ui-grid-cell-contents").filter({ hasText: pattern }).first();

            if (await textCell.count() > 0) {
                await textCell.click();
            }

            const filterActionBtn = page.locator("button:has-text('Filtrar')");
            if (await filterActionBtn.count() > 0) {
                await filterActionBtn.click();
            } else {
                const genericFilterBtn = page.locator("button.ui-grid-filter-button");
                if (await genericFilterBtn.count() > 0) {
                    await genericFilterBtn.click();
                }
            }

            await delay(TIMEOUTS.filter);

        } catch {
            // Filter failed, continue without filtering
        }
    }

    private async setPagination(page: Page): Promise<void> {
        try {
            const paginationSelect = page.locator("select[ng-model='grid.options.paginationPageSize']");
            if (await paginationSelect.count() > 0) {
                await paginationSelect.selectOption({ label: "1000" });
                await delay(TIMEOUTS.pagination);
            }
        } catch {
            // Pagination failed, continue with default
        }
    }

    private async extractData(page: Page): Promise<string[]> {
        const extractedNumbers = new Set<string>();
        const numberPattern = /\d{10,}/g;

        // Method 1: Angular Scope (fastest)
        try {
            const rawData = await page.evaluate(() => {
                try {
                    const gridElem = document.querySelector(".ui-grid-canvas");
                    if (!gridElem) return null;
                    // @ts-expect-error Angular global
                    const scope = angular.element(gridElem).scope();
                    if (!scope?.grid?.rows) return null;
                    return scope.grid.rows.map((row: { entity: unknown }) => JSON.stringify(row.entity));
                } catch {
                    return null;
                }
            });

            if (rawData) {
                for (const text of rawData) {
                    const matches = text.match(numberPattern);
                    matches?.forEach((m: string) => extractedNumbers.add(m));
                }
                return Array.from(extractedNumbers);
            }
        } catch {
            // Angular extraction failed, try scroll method
        }

        // Method 2: Scroll extraction (fallback)
        try {
            await page.waitForSelector(".ui-grid-canvas div[role='row']", {
                timeout: 20000,
                state: "attached",
            });

            let lastCount = 0;
            let noChangeCount = 0;
            const maxScrollAttempts = 50;

            for (let i = 0; i < maxScrollAttempts; i++) {
                const rows = await page.locator(".ui-grid-canvas div[role='row']").all();

                for (const row of rows) {
                    const firstCell = row.locator("div[role='gridcell']").first();
                    if (await firstCell.count() > 0) {
                        const text = (await firstCell.innerText()).trim();
                        const cleanText = text.replace(/[^0-9]/g, "");
                        if (cleanText.match(/\d{10,}/)) {
                            extractedNumbers.add(text);
                        }
                    }
                }

                const currentCount = extractedNumbers.size;
                noChangeCount = currentCount === lastCount ? noChangeCount + 1 : 0;
                lastCount = currentCount;

                if (noChangeCount >= 3) break;

                await page.evaluate(() => {
                    const container = document.querySelector(".ui-grid-viewport");
                    if (container) {
                        container.scrollTop += container.clientHeight;
                    } else {
                        window.scrollBy(0, window.innerHeight);
                    }
                });

                await delay(TIMEOUTS.scroll);
            }
        } catch {
            // Scroll extraction failed
        }

        return Array.from(extractedNumbers);
    }

    private async extractProgress(page: Page): Promise<string> {
        try {
            const row = page.locator("tr:has-text('Progresso')");
            if (await row.count() > 0) {
                const text = await row.first().innerText();
                const match = text.match(/(\d{1,3})%/);
                if (match) return `${match[1]}%`;
            }

            const element = page.locator("*:has-text('Progresso')").last();
            if (await element.count() > 0) {
                const text = await element.innerText();
                const match = text.match(/(\d{1,3})%/);
                if (match) return `${match[1]}%`;
            }
        } catch {
            // Progress extraction failed
        }

        return "0%";
    }

    private calculateStats(resultFiles: string[]): ReportStats[] {
        const reportsStats: ReportStats[] = [];

        for (const filename of resultFiles) {
            try {
                const match = filename.match(/report_(\d+)_numbers/);
                const reportId = match?.[1] ?? "Unknown";

                const content = fs.readFileSync(filename, "utf-8");
                const data = JSON.parse(content);

                const numbers: string[] = Array.isArray(data) ? data : data.numbers ?? [];
                const progress: string = Array.isArray(data) ? "100%" : data.progress ?? "100%";

                let totalAtrasados = 0;
                const tribunaisCount: Record<string, number> = {};

                for (const num of numbers) {
                    const tribunal = getTribunalFromCnj(num);
                    if (tribunal) {
                        totalAtrasados++;
                        tribunaisCount[tribunal] = (tribunaisCount[tribunal] ?? 0) + 1;
                    }
                }

                reportsStats.push({
                    report_id: reportId,
                    report_url: getReportUrl(reportId),
                    total_atrasados: totalAtrasados,
                    tribunais: tribunaisCount,
                    total_tribunais: Object.keys(tribunaisCount).length,
                    progress,
                });

            } catch (err) {
                console.error(`Error calculating stats for ${filename}:`, err);
            }
        }

        return reportsStats;
    }
}

// --- Server Actions ---

export async function startScraping(reportIdsText: string): Promise<StartScrapingResult> {
    const reportIds = reportIdsText.match(/\b\d{4,}\b/g);

    if (!reportIds || reportIds.length === 0) {
        return { error: "Nenhum ID válido encontrado." };
    }

    const token = process.env.DIGESTO_API_TOKEN;
    if (!token) {
        return { error: "Token de autenticação não configurado." };
    }

    const service = new ScraperService(token);
    const taskId = service.startScrapingTask(reportIds);

    return { taskId, status: "PENDING" };
}

export async function checkStatus(taskId: string): Promise<TaskState | { error: string }> {
    const task = TASKS.get(taskId);
    if (!task) {
        return { error: "Tarefa não encontrada." };
    }
    return task;
}
