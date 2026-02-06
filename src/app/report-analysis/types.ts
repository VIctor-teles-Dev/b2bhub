/**
 * Type definitions for the Report Analysis module
 */

/** Task execution status */
export type TaskStatus = "PENDING" | "RUNNING" | "COMPLETED" | "ERROR";

/** State of a scraping task */
export interface TaskState {
    status: TaskStatus;
    message: string;
    result: string[] | null;
    stats: ReportStats[] | null;
    errors: string[];
}

/** Statistics for a single report */
export interface ReportStats {
    report_id: string;
    report_url: string;
    total_atrasados: number;
    tribunais: Record<string, number>;
    total_tribunais: number;
    progress: string;
    numbers: string[];
}

/** Data extracted from a report page */
export interface ReportData {
    numbers: string[];
    progress: string;
}

/** Result of starting a scraping task */
export interface StartScrapingResult {
    taskId?: string;
    status?: string;
    error?: string;
}
