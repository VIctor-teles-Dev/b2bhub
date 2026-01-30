/**
 * Configuration constants for the Report Analysis scraper
 */

/** Maximum retry attempts for failed scraping operations */
export const MAX_RETRIES = 3;

/** Delay between retries in milliseconds */
export const RETRY_DELAY_MS = 2000;

/** Cache time-to-live: 1 hour in milliseconds */
export const CACHE_TTL_MS = 3600 * 1000;

/** Maximum concurrent browser contexts for parallel processing */
export const MAX_CONCURRENT_CONTEXTS = 6;

/** Browser launch arguments for Playwright (optimized for headless) */
export const BROWSER_ARGS = [
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-setuid-sandbox",
    "--no-sandbox",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-translate",
] as const;

/** Digesto platform base URLs */
export const DIGESTO_URLS = {
    virtual: "https://op.digesto.com.br/#/virtual_report/detalhes/",
    report: "https://op.digesto.com.br/#/relatorio/detalhes/",
} as const;

/** Timeout configurations in milliseconds */
export const TIMEOUTS = {
    navigation: 60000,
    element: 10000,
    scroll: 500,
    filter: 2000,
    pagination: 2000,
} as const;
