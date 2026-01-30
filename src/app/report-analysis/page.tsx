"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { startScraping, checkStatus } from "./actions";
import { ReportCard, LoadingState } from "./components";
import type { ReportStats, TaskState } from "./types";

const POLLING_INTERVAL_MS = 2000;

export default function ReportAnalysisPage() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<TaskState | null>(null);

    const handleStart = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setTaskStatus(null);
        setTaskId(null);

        try {
            const result = await startScraping(input);

            if (result.error) {
                setTaskStatus({ status: "ERROR", message: result.error, result: null, stats: null, errors: [] });
                setLoading(false);
                return;
            }

            if (result.taskId) {
                setTaskId(result.taskId);
            }
        } catch {
            setTaskStatus({ status: "ERROR", message: "Erro ao iniciar análise.", result: null, stats: null, errors: [] });
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!taskId) return;

        const interval = setInterval(async () => {
            try {
                const status = await checkStatus(taskId);

                if ("error" in status) {
                    setTaskStatus({ status: "ERROR", message: status.error, result: null, stats: null, errors: [] });
                    setTaskId(null);
                    setLoading(false);
                    return;
                }

                setTaskStatus(status);

                if (status.status === "COMPLETED" || status.status === "ERROR") {
                    setTaskId(null);
                    setLoading(false);
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, POLLING_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [taskId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 bg-slate-50/30">
            <div className="w-full max-w-5xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-3 mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Análise de Relatórios
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Cole os IDs dos relatórios do Digesto para extrair automaticamente as métricas
                        de atraso e distribuição por tribunal.
                    </p>
                </div>

                {/* Main Card */}
                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white ring-1 ring-slate-100">
                    <CardContent className="p-8 md:p-12 space-y-8">
                        {/* Input Section */}
                        <div className="space-y-4">
                            <label
                                htmlFor="report-ids"
                                className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1"
                            >
                                IDs dos Relatórios
                            </label>
                            <div className="relative">
                                <textarea
                                    id="report-ids"
                                    className="w-full min-h-[120px] p-6 text-lg bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#0A4D3C]/20 focus:border-[#0A4D3C] rounded-2xl outline-none transition-all resize-y font-mono text-slate-700 placeholder:text-slate-300"
                                    placeholder="Ex: 348341, 123456..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={loading}
                                />
                                <div className="absolute bottom-4 right-4">
                                    <Button
                                        onClick={handleStart}
                                        disabled={loading || !input.trim()}
                                        className="h-12 px-6 bg-[#0A4D3C] hover:bg-[#083828] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/10 transition-all hover:shadow-emerald-900/20 hover:scale-105 active:scale-95"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processando
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4" />
                                                Analisar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && !taskStatus?.stats && (
                            <LoadingState message={taskStatus?.message} />
                        )}

                        {/* Error State */}
                        {taskStatus?.status === "ERROR" && (
                            <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Erro na Análise</AlertTitle>
                                <AlertDescription>{taskStatus.message}</AlertDescription>
                            </Alert>
                        )}

                        {/* Results Grid */}
                        {taskStatus?.stats && taskStatus.stats.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-8 duration-500">
                                {taskStatus.stats.map((stat) => (
                                    <ReportCard key={stat.report_id} stat={stat} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
