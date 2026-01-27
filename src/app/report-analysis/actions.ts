"use server";

import { chromium, Browser, Page } from "playwright";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const CACHE_TTL = 3600 * 1000; // 1 hour in ms

// Global dictionary to track tasks
// Note: In a serverless environment (like Vercel), this global variable will be reset.
// This implementation assumes a long-running server (VPS, Docker, etc.).
const TASKS: Record<string, any> = {};

// Court Mapping
const COURT_MAP: Record<string, string> = {
    "801": "TJAC", "802": "TJAL", "803": "TJAP", "804": "TJAM", "805": "TJBA",
    "806": "TJCE", "807": "TJDFT", "808": "TJES", "809": "TJGO", "810": "TJMA",
    "811": "TJMT", "812": "TJMS", "813": "TJMG", "814": "TJPA", "815": "TJPB",
    "816": "TJPR", "817": "TJPE", "818": "TJPI", "819": "TJRJ", "820": "TJRN",
    "821": "TJRS", "822": "TJRO", "823": "TJRR", "824": "TJSC", "825": "TJSE",
    "826": "TJSP", "827": "TJTO", "401": "TRF1", "402": "TRF2", "403": "TRF3",
    "404": "TRF4", "405": "TRF5", "406": "TRF6", "501": "TRT1", "502": "TRT2",
    "503": "TRT3", "504": "TRT4", "505": "TRT5", "506": "TRT6", "507": "TRT7",
    "508": "TRT8", "509": "TRT9", "510": "TRT10", "511": "TRT11", "512": "TRT12",
    "513": "TRT13", "514": "TRT14", "515": "TRT15", "516": "TRT16", "517": "TRT17",
    "518": "TRT18", "519": "TRT19", "520": "TRT20", "521": "TRT21", "522": "TRT22",
    "523": "TRT23", "524": "TRT24"
};

class ScraperService {
    private bearerToken: string;
    private baseUrlVirtual = "https://op.digesto.com.br/#/virtual_report/detalhes/";
    private baseUrlReport = "https://op.digesto.com.br/#/relatorio/detalhes/";

    constructor(bearerToken: string) {
        this.bearerToken = bearerToken;
    }

    public startScrapingTask(reportIds: string[]): string {
        const uniqueIds = Array.from(new Set(reportIds));
        const taskId = uuidv4();

        TASKS[taskId] = {
            status: "PENDING",
            message: "Inicializando...",
            result: null,
            stats: null,
            errors: []
        };

        // Start background processing without awaiting
        this.runScraping(taskId, uniqueIds).catch(err => {
            console.error(`Task ${taskId} failed fatally:`, err);
            TASKS[taskId].status = "ERROR";
            TASKS[taskId].message = `Erro fatal: ${err.message}`;
        });

        return taskId;
    }

    private async runScraping(taskId: string, reportIds: string[]) {
        TASKS[taskId].status = "RUNNING";
        TASKS[taskId].message = "Iniciando navegador...";

        const results: string[] = [];
        const errors: string[] = [];
        const total = reportIds.length;

        let browser: Browser | null = null;

        try {
            browser = await chromium.launch({
                headless: true,
                args: [
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                    '--disable-background-networking',
                    '--disable-sync',
                    '--disable-translate',
                ]
            });

            for (let i = 0; i < total; i++) {
                const reportId = reportIds[i];
                TASKS[taskId].message = `Processando ${i + 1}/${total}: ID ${reportId}`;

                const dataDir = path.join(process.cwd(), "data");
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true });
                }

                const filename = path.join(dataDir, `report_${reportId}_numbers.json`);

                // Check cache
                if (fs.existsSync(filename)) {
                    const stats = fs.statSync(filename);
                    const fileAge = Date.now() - stats.mtimeMs;
                    if (fileAge < CACHE_TTL) {
                        results.push(filename);
                        continue;
                    }
                }

                // Process with retry logic
                let success = false;
                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    try {
                        const data = await this.processSingleReport(browser, reportId);
                        if (data && data.numbers) {
                            fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf-8");
                            results.push(filename);
                            success = true;
                            break;
                        } else {
                            if (attempt === MAX_RETRIES) errors.push(`ID ${reportId}: Sem dados`);
                        }
                    } catch (e: any) {
                        if (attempt < MAX_RETRIES) {
                            await new Promise(res => setTimeout(res, RETRY_DELAY * attempt));
                            continue;
                        }
                        errors.push(`ID ${reportId}: ${e.message} (após ${MAX_RETRIES} tentativas)`);
                    }
                }
            }

            const stats = this.calculateStats(results);

            TASKS[taskId].stats = stats;
            TASKS[taskId].result = results;
            TASKS[taskId].errors = errors;
            TASKS[taskId].message = `Concluído! ${results.length}/${total} relatórios processados.`;
            TASKS[taskId].status = "COMPLETED";

        } catch (e: any) {
            TASKS[taskId].status = "ERROR";
            TASKS[taskId].message = `Erro fatal: ${e.message}`;
        } finally {
            if (browser) await browser.close();
        }
    }

    private async processSingleReport(browser: Browser, reportId: string) {
        const url = reportId.length === 6
            ? `${this.baseUrlReport}${reportId}`
            : `${this.baseUrlVirtual}${reportId}`;

        const context = await browser.newContext({
            extraHTTPHeaders: { "Authorization": `Bearer ${this.bearerToken}` },
            viewport: { width: 1366, height: 768 }
        });

        const page = await context.newPage();

        try {
            // 1. Access Report
            await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
            await page.waitForTimeout(1500);

            // 2. Click "Pedido de atualização"
            try {
                const updateLink = page.locator("a:has-text('Pedido de atualização')");
                if (await updateLink.isVisible({ timeout: 10000 })) {
                    await updateLink.click();
                }
            } catch (e) {
                // Ignore if not found
            }

            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2500);

            // 3. Apply Filter "Não atualizados"
            await this.applyFilter(page);

            // 4. Set Pagination to 1000
            await this.setPagination(page);

            // 5. Extract Data
            const numbers = await this.extractData(page);
            const progress = await this.extractProgress(page);

            return { numbers, progress };

        } finally {
            await context.close();
        }
    }

    private async applyFilter(page: Page) {
        try {
            const statusHeaderCell = page.locator(".ui-grid-header-cell:has-text('Status')");

            // Open Menu
            await statusHeaderCell.hover({ timeout: 5000 });
            const buttons = await statusHeaderCell.locator("button").all();
            let filterBtn = null;

            for (const btn of buttons) {
                if ((await btn.innerText()).includes("...")) {
                    filterBtn = btn;
                    break;
                }
            }
            if (!filterBtn && buttons.length > 0) filterBtn = buttons[0];

            if (filterBtn) {
                await filterBtn.click();
            } else {
                await statusHeaderCell.locator(".ui-grid-icon-menu").click();
            }

            await page.waitForTimeout(1000);

            // Select "Não atualizados"
            // Note: Playwright's locator with regex is powerful
            const pattern = /N[ãa]o\s+Atualizado(s)?/i;
            const textCell = page.locator("div.ui-grid-cell-contents").filter({ hasText: pattern }).first();

            if (await textCell.count() > 0) {
                // Strategy: Pinned Columns check logic simplified for TS
                // Just trying to click the cell or row header
                await textCell.click();
            }

            // Click Filter Button
            const filterActionBtn = page.locator("button:has-text('Filtrar')");
            if (await filterActionBtn.count() > 0) {
                await filterActionBtn.click();
            } else {
                const genericFilterBtn = page.locator("button.ui-grid-filter-button");
                if (await genericFilterBtn.count() > 0) {
                    await genericFilterBtn.click();
                }
            }

            await page.waitForTimeout(2000);

        } catch (e) {
            // Fail silently
        }
    }

    private async setPagination(page: Page) {
        try {
            const paginationSelect = page.locator("select[ng-model='grid.options.paginationPageSize']");
            if (await paginationSelect.count() > 0) {
                await paginationSelect.selectOption({ label: "1000" });
                await page.waitForTimeout(2000);
            }
        } catch (e) {
            // Ignore
        }
    }

    private async extractData(page: Page): Promise<string[]> {
        const extractedNumbers = new Set<string>();
        const numberPattern = /\d{10,}/g;

        // Method 1: Angular Scope
        try {
            const rawData = await page.evaluate(() => {
                try {
                    const gridElem = document.querySelector('.ui-grid-canvas');
                    if (!gridElem) return null;
                    // @ts-ignore
                    const scope = angular.element(gridElem).scope();
                    if (!scope || !scope.grid || !scope.grid.rows) return null;
                    // @ts-ignore
                    return scope.grid.rows.map(row => JSON.stringify(row.entity));
                } catch (e) { return null; }
            });

            if (rawData) {
                for (const text of rawData) {
                    const matches = text.match(numberPattern);
                    if (matches) {
                        matches.forEach((m: string) => extractedNumbers.add(m));
                    }
                }
                return Array.from(extractedNumbers);
            }
        } catch (e) {
            // Ignore
        }

        // Method 2: Scroll
        try {
            await page.waitForSelector(".ui-grid-canvas div[role='row']", { timeout: 20000, state: "attached" });

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
                        if (text && cleanText.match(/\d{10,}/)) {
                            extractedNumbers.add(text);
                        }
                    }
                }

                const currentCount = extractedNumbers.size;
                if (currentCount === lastCount) {
                    noChangeCount++;
                } else {
                    noChangeCount = 0;
                }
                lastCount = currentCount;

                if (noChangeCount >= 3) break;

                await page.evaluate(() => {
                    const container = document.querySelector('.ui-grid-viewport');
                    if (container) {
                        container.scrollTop += container.clientHeight;
                    } else {
                        window.scrollBy(0, window.innerHeight);
                    }
                });
                await page.waitForTimeout(500);
            }
        } catch (e) {
            // Ignore
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
        } catch (e) {
            // Ignore
        }
        return "0%";
    }

    private calculateStats(resultFiles: string[]) {
        const reportsStats = [];

        for (const filename of resultFiles) {
            try {
                const match = filename.match(/report_(\d+)_numbers/);
                const reportId = match ? match[1] : "Unknown";

                const content = fs.readFileSync(filename, 'utf-8');
                const data = JSON.parse(content);

                let numbers: string[] = [];
                let progress = "100%";

                if (Array.isArray(data)) {
                    numbers = data;
                } else {
                    numbers = data.numbers || [];
                    progress = data.progress || "100%";
                }

                let totalAtrasados = 0;
                const tribunaisCount: Record<string, number> = {};

                for (const num of numbers) {
                    const tribunal = this.getTribunalFromCnj(num);
                    if (tribunal) {
                        totalAtrasados++;
                        tribunaisCount[tribunal] = (tribunaisCount[tribunal] || 0) + 1;
                    }
                }

                const reportUrl = reportId.length === 6
                    ? `${this.baseUrlReport}${reportId}`
                    : `${this.baseUrlVirtual}${reportId}`;

                reportsStats.push({
                    report_id: reportId,
                    report_url: reportUrl,
                    total_atrasados: totalAtrasados,
                    tribunais: tribunaisCount,
                    total_tribunais: Object.keys(tribunaisCount).length,
                    progress
                });

            } catch (e) {
                // Ignore
            }
        }
        return reportsStats;
    }

    private getTribunalFromCnj(cnj: string): string | null {
        const clean = cnj.replace(/\D/g, '');
        if (clean.length >= 14) {
            // NNNNNNN-DD.YYYY.J.TR.OOOO
            // TR is at index -7 to -4 (exclusive of -4) => slice(-7, -4)
            const courtCode = clean.slice(-7, -4);
            return COURT_MAP[courtCode] || `Tribunal ${courtCode}`;
        }
        return null;
    }
}

// --- Server Actions ---

export async function startScraping(reportIdsText: string) {
    const reportIds = reportIdsText.match(/\b\d{4,}\b/g);

    if (!reportIds || reportIds.length === 0) {
        return { error: 'Nenhum ID válido encontrado.' };
    }

    const token = process.env.DIGESTO_API_TOKEN;
    if (!token) {
        return { error: 'Token de autenticação não configurado.' };
    }

    const service = new ScraperService(token);
    const taskId = service.startScrapingTask(reportIds);

    return { taskId, status: 'PENDING' };
}

export async function checkStatus(taskId: string) {
    const task = TASKS[taskId];
    if (!task) {
        return { error: 'Tarefa não encontrada.' };
    }
    return task;
}
